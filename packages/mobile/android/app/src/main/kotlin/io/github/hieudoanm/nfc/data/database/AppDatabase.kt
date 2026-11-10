package io.github.hieudoanm.nfc.data.database

import androidx.room.Database
import androidx.room.RoomDatabase
import io.github.hieudoanm.nfc.data.entity.TagHistory
import io.github.hieudoanm.nfc.data.entity.TagProfile

@Database(
    entities = [TagHistory::class, TagProfile::class],
    version = 2,
    exportSchema = false,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun tagHistoryDao(): TagHistoryDao
    abstract fun tagProfileDao(): TagProfileDao
}
