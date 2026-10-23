package io.github.hieudoanm.nfc.ui.history

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import io.github.hieudoanm.nfc.data.entity.TagHistory
import io.github.hieudoanm.nfc.data.repository.NfcRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HistoryState(
    val items: List<TagHistory> = emptyList(),
)

@HiltViewModel
class HistoryViewModel @Inject constructor(
    private val nfcRepository: NfcRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(HistoryState())
    val state: StateFlow<HistoryState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            nfcRepository.observeHistory().collect { items ->
                _state.value = HistoryState(items = items)
            }
        }
    }

    fun clearHistory() {
        viewModelScope.launch {
            nfcRepository.clearHistory()
        }
    }
}
