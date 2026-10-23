package io.github.hieudoanm.block.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "schedules")
data class Schedule(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val packageName: String,
    val startTimeMillis: Long,
    val endTimeMillis: Long,
    val daysOfWeek: Int,
    val enabled: Boolean = true,
)
