package io.github.hieudoanm.nfc.domain.model

sealed interface NdefRecordModel {
    data class TextRecord(
        val text: String,
        val languageCode: String,
    ) : NdefRecordModel

    data class UriRecord(
        val uri: String,
    ) : NdefRecordModel

    class MimeRecord(
        val mimeType: String,
        val payload: ByteArray,
    ) : NdefRecordModel {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (other !is MimeRecord) return false
            return mimeType == other.mimeType && payload.contentEquals(other.payload)
        }

        override fun hashCode(): Int = 31 * mimeType.hashCode() + payload.contentHashCode()
    }

    data class AarRecord(
        val packageName: String,
    ) : NdefRecordModel

    class UnknownRecord(
        val tnf: Short,
        val type: ByteArray,
        val payload: ByteArray,
    ) : NdefRecordModel {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (other !is UnknownRecord) return false
            return tnf == other.tnf && type.contentEquals(other.type) && payload.contentEquals(other.payload)
        }

        override fun hashCode(): Int {
            var result = tnf.hashCode()
            result = 31 * result + type.contentHashCode()
            result = 31 * result + payload.contentHashCode()
            return result
        }
    }
}
