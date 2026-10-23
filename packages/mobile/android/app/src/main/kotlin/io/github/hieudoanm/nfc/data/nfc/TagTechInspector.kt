package io.github.hieudoanm.nfc.data.nfc

import android.nfc.Tag
import android.nfc.tech.Ndef
import android.nfc.tech.NdefFormatable
import android.nfc.tech.NfcA
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TagTechInspector @Inject constructor() {

    fun inspect(tag: Tag): TagTechResult {
        val technologies = tag.techList.toList()
        val uid = tag.id.joinToString("") { "%02X".format(it) }
        val ndef = Ndef.get(tag)
        val ndefFormatable = NdefFormatable.get(tag)
        val isWritable = ndef?.isWritable ?: ndefFormatable != null
        val maxSize = ndef?.maxSize ?: 0
        val nfcA = NfcA.get(tag)

        val atqa: String? = nfcA?.let { tech ->
            try {
                tech.connect()
                tech.atqa.joinToString("") { "%02X".format(it) }
            } catch (_: IOException) {
                null
            } finally {
                runCatching { tech.close() }
            }
        }

        val sak: String? = nfcA?.let { tech ->
            try {
                tech.connect()
                "%02X".format(tech.sak)
            } catch (_: IOException) {
                null
            } finally {
                runCatching { tech.close() }
            }
        }

        return TagTechResult(
            uid = uid,
            technologies = technologies,
            isWritable = isWritable,
            isNdefFormatable = ndefFormatable != null,
            maxSize = maxSize,
            atqa = atqa,
            sak = sak,
        )
    }

    data class TagTechResult(
        val uid: String,
        val technologies: List<String>,
        val isWritable: Boolean,
        val isNdefFormatable: Boolean,
        val maxSize: Int,
        val atqa: String?,
        val sak: String?,
    )
}
