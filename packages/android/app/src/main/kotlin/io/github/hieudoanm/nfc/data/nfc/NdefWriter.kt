package io.github.hieudoanm.nfc.data.nfc

import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.nfc.tech.NdefFormatable
import io.github.hieudoanm.nfc.domain.model.NdefRecordModel
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NdefWriter @Inject constructor() {

    sealed interface WriteResult {
        data object Success : WriteResult
        data class Error(val message: String) : WriteResult
    }

    fun createMessage(records: List<NdefRecordModel>): NdefMessage {
        val ndefRecords = records.map { it.toNdefRecord() }
        return NdefMessage(ndefRecords.toTypedArray())
    }

    fun write(tag: Tag, message: NdefMessage): WriteResult {
        val ndef = Ndef.get(tag)
        if (ndef != null) {
            return try {
                ndef.connect()
                ndef.writeNdefMessage(message)
                ndef.close()
                WriteResult.Success
            } catch (e: IOException) {
                WriteResult.Error(e.message ?: "Write failed")
            }
        }

        val ndefFormatable = NdefFormatable.get(tag)
        if (ndefFormatable != null) {
            return try {
                ndefFormatable.connect()
                ndefFormatable.format(message)
                ndefFormatable.close()
                WriteResult.Success
            } catch (e: IOException) {
                WriteResult.Error(e.message ?: "Format failed")
            }
        }

        return WriteResult.Error("Tag does not support NDEF")
    }

    fun makeReadOnly(tag: Tag): WriteResult {
        val ndef = Ndef.get(tag) ?: return WriteResult.Error("Tag is not NDEF")
        return try {
            ndef.connect()
            ndef.makeReadOnly()
            ndef.close()
            WriteResult.Success
        } catch (e: IOException) {
            WriteResult.Error(e.message ?: "Failed to make read-only")
        }
    }
}

private fun NdefRecordModel.toNdefRecord(): NdefRecord = when (this) {
    is NdefRecordModel.TextRecord -> NdefRecord.createTextRecord(languageCode, text)
    is NdefRecordModel.UriRecord -> NdefRecord.createUri(uri)
    is NdefRecordModel.MimeRecord -> NdefRecord.createMime(mimeType, payload)
    is NdefRecordModel.AarRecord -> NdefRecord.createApplicationRecord(packageName)
    is NdefRecordModel.UnknownRecord -> NdefRecord(tnf, type, ByteArray(0), payload)
}
