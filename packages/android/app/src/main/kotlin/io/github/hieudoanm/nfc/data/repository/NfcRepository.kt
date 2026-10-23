package io.github.hieudoanm.nfc.data.repository

import android.nfc.Tag
import android.nfc.tech.Ndef
import android.nfc.tech.NdefFormatable
import io.github.hieudoanm.nfc.data.database.TagHistoryDao
import io.github.hieudoanm.nfc.data.entity.TagHistory
import io.github.hieudoanm.nfc.data.nfc.NdefReader
import io.github.hieudoanm.nfc.data.nfc.TagTechInspector
import io.github.hieudoanm.nfc.domain.model.NdefRecordModel
import io.github.hieudoanm.nfc.domain.model.TagInfo
import kotlinx.coroutines.flow.Flow
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NfcRepository @Inject constructor(
    private val tagTechInspector: TagTechInspector,
    private val ndefReader: NdefReader,
    private val tagHistoryDao: TagHistoryDao,
) {

    fun readTag(tag: Tag): TagInfo {
        val techResult = tagTechInspector.inspect(tag)
        val ndef = Ndef.get(tag)
        val ndefFormatable = NdefFormatable.get(tag)

        val (records, usedSize) = if (ndef != null) {
            try {
                ndefReader.read(ndef)
            } catch (_: IOException) {
                emptyList<NdefRecordModel>() to 0
            }
        } else if (ndefFormatable != null) {
            ndefReader.readFormatable(ndefFormatable) to 0
        } else {
            emptyList<NdefRecordModel>() to 0
        }

        return TagInfo(
            uid = techResult.uid,
            techList = techResult.technologies,
            isWritable = techResult.isWritable,
            isNdefFormatable = techResult.isNdefFormatable,
            maxSize = techResult.maxSize,
            usedSize = usedSize,
            ndefRecords = records,
        )
    }

    suspend fun saveToHistory(tagInfo: TagInfo): Long {
        val recordsJson = JSONArray().apply {
            tagInfo.ndefRecords.forEach { record ->
                val obj = JSONObject().apply {
                    when (record) {
                        is NdefRecordModel.TextRecord -> {
                            put("type", "text")
                            put("text", record.text)
                            put("languageCode", record.languageCode)
                        }
                        is NdefRecordModel.UriRecord -> {
                            put("type", "uri")
                            put("uri", record.uri)
                        }
                        is NdefRecordModel.MimeRecord -> {
                            put("type", "mime")
                            put("mimeType", record.mimeType)
                        }
                        is NdefRecordModel.AarRecord -> {
                            put("type", "aar")
                            put("packageName", record.packageName)
                        }
                        is NdefRecordModel.UnknownRecord -> {
                            put("type", "unknown")
                            put("tnf", record.tnf.toInt())
                        }
                    }
                }
                put(obj)
            }
        }

        return tagHistoryDao.insert(
            TagHistory(
                uid = tagInfo.uid,
                techSummary = tagInfo.techList.joinToString(", "),
                ndefRecords = recordsJson.toString(),
                isWritable = tagInfo.isWritable,
                maxSize = tagInfo.maxSize,
                usedSize = tagInfo.usedSize,
            )
        )
    }

    fun observeHistory(): Flow<List<TagHistory>> = tagHistoryDao.observeAll()

    suspend fun clearHistory() = tagHistoryDao.deleteAll()
}
