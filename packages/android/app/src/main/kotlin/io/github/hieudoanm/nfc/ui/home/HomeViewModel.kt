package io.github.hieudoanm.nfc.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import io.github.hieudoanm.nfc.data.nfc.TagDispatcher
import io.github.hieudoanm.nfc.data.repository.NfcRepository
import io.github.hieudoanm.nfc.domain.model.TagInfo
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface HomeUiState {
    data object WaitingForTag : HomeUiState
    data object Reading : HomeUiState
    data class Success(val tagInfo: TagInfo) : HomeUiState
    data class Error(val message: String) : HomeUiState
}

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val tagDispatcher: TagDispatcher,
    private val nfcRepository: NfcRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<HomeUiState>(HomeUiState.WaitingForTag)
    val state: StateFlow<HomeUiState> = _state.asStateFlow()

    private val savedTags = mutableSetOf<String>()

    init {
        viewModelScope.launch {
            tagDispatcher.tagFlow.collect { tag ->
                handleTag(tag)
            }
        }
    }

    fun resetState() {
        _state.value = HomeUiState.WaitingForTag
    }

    private fun handleTag(tag: android.nfc.Tag) {
        val tagId = tag.id.joinToString("") { "%02X".format(it) }
        val uid = tagId

        if (uid in savedTags) return
        savedTags.add(uid)

        _state.value = HomeUiState.Reading

        try {
            val tagInfo = nfcRepository.readTag(tag)
            _state.value = HomeUiState.Success(tagInfo)
            viewModelScope.launch {
                nfcRepository.saveToHistory(tagInfo)
            }
        } catch (e: Exception) {
            _state.value = HomeUiState.Error(e.message ?: "Failed to read tag")
        }
    }
}
