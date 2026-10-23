package io.github.hieudoanm.nfc.domain.model

data class TagInfo(
    val uid: String,
    val techList: List<String>,
    val isWritable: Boolean,
    val isNdefFormatable: Boolean,
    val maxSize: Int,
    val usedSize: Int,
    val ndefRecords: List<NdefRecordModel>,
)
