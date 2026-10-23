package io.github.hieudoanm.nfc.data.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import io.github.hieudoanm.nfc.data.entity.TagProfile
import kotlinx.coroutines.flow.Flow

@Dao
interface TagProfileDao {
    @Query("SELECT * FROM tag_profiles ORDER BY createdAt DESC")
    fun observeAll(): Flow<List<TagProfile>>

    @Query("SELECT * FROM tag_profiles WHERE id = :id")
    suspend fun getById(id: Long): TagProfile?

    @Insert
    suspend fun insert(profile: TagProfile): Long

    @Query("DELETE FROM tag_profiles WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("DELETE FROM tag_profiles")
    suspend fun deleteAll()
}
