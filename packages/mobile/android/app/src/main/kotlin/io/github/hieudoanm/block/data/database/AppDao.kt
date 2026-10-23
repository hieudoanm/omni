package io.github.hieudoanm.block.data.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import io.github.hieudoanm.block.data.entity.BlockedApp
import io.github.hieudoanm.block.data.entity.Schedule
import kotlinx.coroutines.flow.Flow

@Dao
interface AppDao {
    @Query("SELECT * FROM blocked_apps WHERE enabled = 1")
    fun observeEnabledBlockedApps(): Flow<List<BlockedApp>>

    @Query("SELECT * FROM blocked_apps ORDER BY label ASC")
    fun observeAllBlockedApps(): Flow<List<BlockedApp>>

    @Query("SELECT * FROM blocked_apps WHERE packageName = :packageName")
    suspend fun getBlockedApp(packageName: String): BlockedApp?

    @Query("SELECT EXISTS(SELECT 1 FROM blocked_apps WHERE packageName = :packageName AND enabled = 1)")
    suspend fun isBlocked(packageName: String): Boolean

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertBlockedApp(app: BlockedApp)

    @Query("DELETE FROM blocked_apps WHERE packageName = :packageName")
    suspend fun removeBlockedApp(packageName: String)

    @Query("SELECT COUNT(*) FROM blocked_apps WHERE enabled = 1")
    fun observeBlockedAppCount(): Flow<Int>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertSchedule(schedule: Schedule)

    @Query("DELETE FROM schedules WHERE id = :id")
    suspend fun removeSchedule(id: Long)

    @Query("SELECT * FROM schedules WHERE enabled = 1")
    fun observeEnabledSchedules(): Flow<List<Schedule>>
}
