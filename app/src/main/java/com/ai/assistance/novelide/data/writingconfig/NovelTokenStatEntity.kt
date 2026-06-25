package com.ai.assistance.novelide.data.writingconfig

import androidx.room.Entity

/**
 * 小说写作 Token 消耗统计
 *
 * 按 date + modelName 做联合主键，确保每天每模型只有一条记录。
 * 多次调用通过 repository 的 upsert 累加写入。
 */
@Entity(tableName = "novel_token_stats", primaryKeys = ["date", "modelName"])
data class NovelTokenStatEntity(
    val date: String,
    val modelName: String,
    val workId: String = "",
    val promptTokens: Long = 0,
    val completionTokens: Long = 0,
    val totalRequests: Int = 0,
    val totalCostMs: Long = 0
)
