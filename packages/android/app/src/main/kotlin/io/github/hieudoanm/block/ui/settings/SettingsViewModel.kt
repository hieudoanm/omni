package io.github.hieudoanm.block.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import io.github.hieudoanm.block.repository.FocusRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SettingsState(
    val blockingEnabled: Boolean = false,
    val launchOnBoot: Boolean = false,
    val darkMode: Boolean = false,
    val ignoreSystemApps: Boolean = true,
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val repository: FocusRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(SettingsState())
    val state: StateFlow<SettingsState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            repository.blockingEnabled.collect { enabled ->
                _state.update { it.copy(blockingEnabled = enabled) }
            }
        }
        viewModelScope.launch {
            repository.launchOnBoot.collect { enabled ->
                _state.update { it.copy(launchOnBoot = enabled) }
            }
        }
        viewModelScope.launch {
            repository.darkMode.collect { enabled ->
                _state.update { it.copy(darkMode = enabled) }
            }
        }
        viewModelScope.launch {
            repository.ignoreSystemApps.collect { enabled ->
                _state.update { it.copy(ignoreSystemApps = enabled) }
            }
        }
    }

    fun setBlockingEnabled(enabled: Boolean) {
        viewModelScope.launch { repository.setBlockingEnabled(enabled) }
    }

    fun setLaunchOnBoot(enabled: Boolean) {
        viewModelScope.launch { repository.setLaunchOnBoot(enabled) }
    }

    fun setDarkMode(enabled: Boolean) {
        viewModelScope.launch { repository.setDarkMode(enabled) }
    }

    fun setIgnoreSystemApps(enabled: Boolean) {
        viewModelScope.launch { repository.setIgnoreSystemApps(enabled) }
    }
}
