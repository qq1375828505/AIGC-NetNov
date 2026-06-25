package com.ai.assistance.novelide.data.writingconfig

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

/**
 * 小说写作专用的 Model 配置
 *
 * 独立于聊天系统的 ModelConfigManager，用于 AI 润色 / 续写 / 大纲 / 起名等写作场景。
 * 用户可以维护多套配置，每套可关联不同 provider（讯飞 / OpenAI / Anthropic / 自定义）。
 */
@Entity(tableName = "novel_model_configs")
data class NovelModelConfigEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val provider: String = "xunfei",
    val endpoint: String = "",
    val apiKey: String = "",
    val modelName: String = "",
    val temperature: Float = 0.7f,
    val maxTokens: Int = 2048,
    val enabled: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
