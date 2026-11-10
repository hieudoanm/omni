package io.github.hieudoanm.nfc.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tag_profiles")
data class TagProfile(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val uid: String,
    val techSummary: String,
    val ndefRecords: String,
    val isWritable: Boolean,
    val maxSize: Int,
    val usedSize: Int,
    val createdAt: Long = System.currentTimeMillis(),
)
