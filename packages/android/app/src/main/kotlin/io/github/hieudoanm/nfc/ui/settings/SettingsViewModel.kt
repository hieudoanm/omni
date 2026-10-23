package io.github.hieudoanm.nfc.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import io.github.hieudoanm.nfc.data.preferences.SettingsDataStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SettingsState(
    val autoOpenUrl: Boolean = false,
    val darkMode: Boolean = false,
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsDataStore: SettingsDataStore,
) : ViewModel() {

    private val _state = MutableStateFlow(SettingsState())
    val state: StateFlow<SettingsState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            settingsDataStore.autoOpenUrl.collect { value ->
                _state.value = _state.value.copy(autoOpenUrl = value)
            }
        }
        viewModelScope.launch {
            settingsDataStore.darkMode.collect { value ->
                _state.value = _state.value.copy(darkMode = value)
            }
        }
    }

    fun setAutoOpenUrl(enabled: Boolean) {
        viewModelScope.launch { settingsDataStore.setAutoOpenUrl(enabled) }
    }

    fun setDarkMode(enabled: Boolean) {
        viewModelScope.launch { settingsDataStore.setDarkMode(enabled) }
    }
}
