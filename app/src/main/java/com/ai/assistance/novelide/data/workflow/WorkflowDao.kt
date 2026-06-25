package com.ai.assistance.novelide.data.workflow

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface WorkflowDao {
    @Query("SELECT * FROM workflows ORDER BY updatedAt DESC")
    fun getAll(): Flow<List<WorkflowEntity>>

    @Query("SELECT * FROM workflows WHERE id = :id")
    suspend fun getById(id: String): WorkflowEntity?

    @Insert
    suspend fun insert(entity: WorkflowEntity)

    @Update
    suspend fun update(entity: WorkflowEntity)

    @Query("DELETE FROM workflows WHERE id = :id")
    suspend fun delete(id: String)
}
