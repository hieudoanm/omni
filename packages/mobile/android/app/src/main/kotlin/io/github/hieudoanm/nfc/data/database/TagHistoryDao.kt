package io.github.hieudoanm.nfc.data.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import io.github.hieudoanm.nfc.data.entity.TagHistory
import kotlinx.coroutines.flow.Flow

@Dao
interface TagHistoryDao {
    @Query("SELECT * FROM tag_history ORDER BY scannedAt DESC")
    fun observeAll(): Flow<List<TagHistory>>

    @Query("SELECT * FROM tag_history WHERE id = :id")
    suspend fun getById(id: Long): TagHistory?

    @Insert
    suspend fun insert(history: TagHistory): Long

    @Query("DELETE FROM tag_history")
    suspend fun deleteAll()
}
