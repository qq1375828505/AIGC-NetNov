package com.ai.assistance.novelide.data.agent

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface AgentDao {
    @Query("SELECT * FROM novel_agents ORDER BY isBuiltIn DESC, updatedAt DESC")
    fun getAll(): Flow<List<AgentEntity>>

    @Query("SELECT * FROM novel_agents WHERE id = :id")
    suspend fun getById(id: String): AgentEntity?

    @Insert
    suspend fun insert(entity: AgentEntity)

    @Update
    suspend fun update(entity: AgentEntity)

    @Query("DELETE FROM novel_agents WHERE id = :id AND isBuiltIn = 0")
    suspend fun delete(id: String)

    @Query("UPDATE novel_agents SET enabled = :enabled, updatedAt = :ts WHERE id = :id")
    suspend fun setEnabled(id: String, enabled: Boolean, ts: Long = System.currentTimeMillis())
}
