package io.github.hieudoanm.block.data.database

import androidx.room.Database
import androidx.room.RoomDatabase
import io.github.hieudoanm.block.data.entity.BlockedApp
import io.github.hieudoanm.block.data.entity.Schedule

@Database(
    entities = [BlockedApp::class, Schedule::class],
    version = 1,
    exportSchema = false,
)
abstract class FocusDatabase : RoomDatabase() {
    abstract fun appDao(): AppDao
}
