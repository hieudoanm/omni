package io.github.hieudoanm.nfc.data.nfc

import android.nfc.Tag
import android.nfc.tech.IsoDep
import android.nfc.tech.MifareClassic
import android.nfc.tech.MifareUltralight
import android.nfc.tech.Ndef
import android.nfc.tech.NdefFormatable
import android.nfc.tech.NfcA
import android.nfc.tech.NfcB
import android.nfc.tech.NfcF
import android.nfc.tech.NfcV
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

        val atqa: String? = try {
            nfcA?.let { it.connect(); val a = it.atqa; it.close(); a.joinToString("") { "%02X".format(it) } }
        } catch (_: IOException) { null }

        val sak: String? = try {
            nfcA?.let { it.connect(); val s = it.sak; it.close(); "%02X".format(s) }
        } catch (_: IOException) { null }

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
