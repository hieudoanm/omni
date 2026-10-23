package io.github.hieudoanm.block.ui.apps

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import io.github.hieudoanm.block.data.entity.BlockedApp
import io.github.hieudoanm.block.repository.FocusRepository
import io.github.hieudoanm.block.repository.InstalledApp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AppListState(
    val searchQuery: String = "",
    val installedApps: List<InstalledApp> = emptyList(),
    val blockedPackages: Set<String> = emptySet(),
    val loading: Boolean = true,
)

@HiltViewModel
class AppListViewModel @Inject constructor(
    private val repository: FocusRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(AppListState())
    val state: StateFlow<AppListState> = _state.asStateFlow()

    init {
        loadApps()
        observeBlockedApps()
    }

    fun onSearchQueryChanged(query: String) {
        _state.update { it.copy(searchQuery = query) }
    }

    fun toggleApp(app: InstalledApp) {
        viewModelScope.launch {
            val isCurrentlyBlocked = _state.value.blockedPackages.contains(app.packageName)
            repository.toggleBlockedApp(app, !isCurrentlyBlocked)
        }
    }

    fun getFilteredApps(): List<InstalledApp> {
        val s = _state.value
        val query = s.searchQuery.trim().lowercase()
        return if (query.isEmpty()) {
            s.installedApps
        } else {
            s.installedApps.filter { it.label.lowercase().contains(query) }
        }
    }

    private fun loadApps() {
        viewModelScope.launch {
            val apps = repository.getInstalledApps()
            _state.update { it.copy(installedApps = apps, loading = false) }
        }
    }

    private fun observeBlockedApps() {
        viewModelScope.launch {
            repository.observeEnabledBlockedPackages().collect { blockedApps ->
                _state.update {
                    it.copy(blockedPackages = blockedApps.map { b -> b.packageName }.toSet())
                }
            }
        }
    }
}
