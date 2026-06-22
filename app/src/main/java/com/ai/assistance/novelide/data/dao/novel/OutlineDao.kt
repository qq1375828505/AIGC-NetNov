package com.ai.assistance.novelide.data.dao.novel

import androidx.room.*
import com.ai.assistance.novelide.data.model.novel.OutlineNode
import kotlinx.coroutines.flow.Flow

@Dao
interface OutlineDao {
    @Query("SELECT * FROM outline_nodes WHERE workId = :workId ORDER BY sortOrder, createdAt")
    fun getOutlineNodesByWorkId(workId: String): Flow<List<OutlineNode>>
    
    @Query("SELECT * FROM outline_nodes WHERE id = :nodeId")
    suspend fun getOutlineNodeById(nodeId: String): OutlineNode?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOutlineNode(node: OutlineNode)
    
    @Update
    suspend fun updateOutlineNode(node: OutlineNode)
    
    @Query("DELETE FROM outline_nodes WHERE id = :nodeId")
    suspend fun deleteOutlineNodeById(nodeId: String)
    
    @Query("DELETE FROM outline_nodes WHERE workId = :workId")
    suspend fun deleteOutlineNodesByWorkId(workId: String)
}
