package com.ai.assistance.novelide.data.memory

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface MemoryDao {
    @Query("SELECT * FROM memories ORDER BY importance DESC, createdAt DESC")
    fun getAll(): Flow<List<MemoryEntity>>

    @Query("SELECT * FROM memories WHERE id = :id")
    suspend fun getById(id: String): MemoryEntity?

    @Insert
    suspend fun insert(entity: MemoryEntity)

    @Update
    suspend fun update(entity: MemoryEntity)

    @Query("DELETE FROM memories WHERE id = :id")
    suspend fun delete(id: String)

    @Query("SELECT * FROM memories WHERE content LIKE :q OR title LIKE :q OR tags LIKE :q ORDER BY importance DESC")
    suspend fun search(q: String): List<MemoryEntity>
}
