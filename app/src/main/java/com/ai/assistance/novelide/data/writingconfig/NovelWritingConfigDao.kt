package com.ai.assistance.novelide.data.writingconfig

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

/**
 * 写作配置子数据库 DAO
 *
 * 管理两个 entity：
 *  - novel_model_configs: 用户配置的写作 Model
 *  - novel_token_stats: 每日 Token 消耗统计
 */
@Dao
interface NovelWritingConfigDao {

    // ==================== ModelConfig ====================

    @Query("SELECT * FROM novel_model_configs ORDER BY updatedAt DESC")
    fun getAllConfigs(): Flow<List<NovelModelConfigEntity>>

    @Query("SELECT * FROM novel_model_configs WHERE id = :id")
    suspend fun getConfigById(id: String): NovelModelConfigEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertConfig(entity: NovelModelConfigEntity)

    @Update
    suspend fun updateConfig(entity: NovelModelConfigEntity)

    @Query("DELETE FROM novel_model_configs WHERE id = :id")
    suspend fun deleteConfig(id: String)

    // ==================== TokenStats ====================

    @Query("SELECT * FROM novel_token_stats ORDER BY date DESC LIMIT 30")
    suspend fun getRecentStats(): List<NovelTokenStatEntity>

    @Query("SELECT * FROM novel_token_stats WHERE modelName = :model ORDER BY date DESC LIMIT 30")
    suspend fun getStatsByModel(model: String): List<NovelTokenStatEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStat(entity: NovelTokenStatEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertStat(entity: NovelTokenStatEntity)
}
