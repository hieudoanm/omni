package io.github.hieudoanm.block.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import io.github.hieudoanm.block.repository.FocusRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeState(
    val accessibilityEnabled: Boolean = false,
    val blockingEnabled: Boolean = false,
    val blockedAppCount: Int = 0,
    val minutesSaved: Int = 0,
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val repository: FocusRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(HomeState())
    val state: StateFlow<HomeState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            combine(
                repository.accessibilityEnabled,
                repository.blockingEnabled,
                repository.observeBlockedAppCount(),
                repository.lastBlockedTime,
            ) { accessibility, blocking, count, lastTime ->
                val minutes = if (lastTime > 0) {
                    ((System.currentTimeMillis() - lastTime) / 60000).toInt()
                } else 0
                HomeState(
                    accessibilityEnabled = accessibility,
                    blockingEnabled = blocking,
                    blockedAppCount = count,
                    minutesSaved = minutes,
                )
            }.collect { state ->
                _state.update { state }
            }
        }
    }
}
