package io.github.hieudoanm.nfc.data.nfc

import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.tech.Ndef
import android.nfc.tech.NdefFormatable
import io.github.hieudoanm.nfc.domain.model.NdefRecordModel
import java.nio.charset.StandardCharsets
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NdefReader @Inject constructor() {

    fun read(ndef: Ndef): Pair<List<NdefRecordModel>, Int> {
        ndef.connect()
        val message = ndef.cachedNdefMessage ?: ndef.ndefMessage
        val records = message?.records?.map { parseRecord(it) } ?: emptyList()
        val usedSize = message?.toByteArray()?.size ?: 0
        ndef.close()
        return Pair(records, usedSize)
    }

    fun readFormatable(ndefFormatable: NdefFormatable): List<NdefRecordModel> {
        ndefFormatable.connect()
        ndefFormatable.close()
        return emptyList()
    }

    private fun parseRecord(record: NdefRecord): NdefRecordModel {
        return when (record.tnf) {
            NdefRecord.TNF_WELL_KNOWN -> parseWellKnown(record)
            NdefRecord.TNF_MIME_MEDIA -> parseMime(record)
            NdefRecord.TNF_ABSOLUTE_URI -> NdefRecordModel.UriRecord(
                uri = String(record.payload, StandardCharsets.UTF_8)
            )
            NdefRecord.TNF_EXTERNAL_TYPE -> {
                val typeStr = String(record.type, StandardCharsets.US_ASCII)
                if (typeStr == "android.com:pkg") {
                    val packageName = String(record.payload, StandardCharsets.UTF_8)
                    NdefRecordModel.AarRecord(packageName = packageName)
                } else {
                    NdefRecordModel.UnknownRecord(
                        tnf = record.tnf,
                        type = record.type,
                        payload = record.payload,
                    )
                }
            }
            else -> NdefRecordModel.UnknownRecord(
                tnf = record.tnf,
                type = record.type,
                payload = record.payload,
            )
        }
    }

    private fun parseWellKnown(record: NdefRecord): NdefRecordModel {
        val type = String(record.type, StandardCharsets.UTF_8)
        return when {
            type == "T" -> parseText(record)
            type == "U" -> parseUri(record)
            type == "Sp" -> parseSmartPoster(record)
            else -> NdefRecordModel.UnknownRecord(
                tnf = record.tnf,
                type = record.type,
                payload = record.payload,
            )
        }
    }

    private fun parseText(record: NdefRecord): NdefRecordModel.TextRecord {
        val payload = record.payload
        val statusByte = payload[0].toInt() and 0xFF
        val encoding = if (statusByte and 0x80 == 0) StandardCharsets.UTF_8 else StandardCharsets.UTF_16
        val languageCodeLength = statusByte and 0x3F
        val languageCode = String(payload, 1, languageCodeLength, StandardCharsets.US_ASCII)
        val text = String(payload, 1 + languageCodeLength, payload.size - 1 - languageCodeLength, encoding)
        return NdefRecordModel.TextRecord(text = text, languageCode = languageCode)
    }

    private fun parseUri(record: NdefRecord): NdefRecordModel.UriRecord {
        val payload = record.payload
        val prefixCode = payload[0].toInt()
        val body = String(payload, 1, payload.size - 1, StandardCharsets.UTF_8)
        val uri = URI_PREFIX_MAP[prefixCode]?.let { prefix -> prefix + body } ?: body
        return NdefRecordModel.UriRecord(uri = uri)
    }

    companion object {
        private val URI_PREFIX_MAP = mapOf(
            0x00 to "",
            0x01 to "http://www.",
            0x02 to "https://www.",
            0x03 to "http://",
            0x04 to "https://",
            0x05 to "tel:",
            0x06 to "mailto:",
            0x07 to "ftp://anonymous:anonymous@",
            0x08 to "ftp://ftp.",
            0x09 to "ftps://",
            0x0A to "ftp://",
            0x0B to "file://",
            0x0C to "content://",
            0x0D to "urn:epc:id:",
            0x0E to "urn:epc:tag:",
            0x0F to "urn:epc:pat:",
            0x10 to "urn:epc:raw:",
            0x11 to "urn:epc:",
            0x12 to "urn:nfc:",
        )
    }

    private fun parseSmartPoster(record: NdefRecord): NdefRecordModel.UriRecord {
        try {
            val subRecords = NdefMessage(record.payload).records
            for (sub in subRecords) {
                if (String(sub.type, StandardCharsets.UTF_8) == "U") {
                    return parseUri(sub)
                }
            }
        } catch (_: Exception) { }
        return NdefRecordModel.UriRecord(uri = "")
    }

    private fun parseMime(record: NdefRecord): NdefRecordModel.MimeRecord {
        val mimeType = String(record.type, StandardCharsets.US_ASCII).lowercase()
        return NdefRecordModel.MimeRecord(mimeType = mimeType, payload = record.payload)
    }
}
