package com.ai.assistance.novelide.data.agent

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName
import java.util.UUID

/**
 * 通用 AI Agent 配置实体
 *
 * 与番茄钟 Agent (TomatoAgent) 完全独立，使用独立的子 Room 数据库 (AgentDatabase / novelide_agent.db)
 * 用于支持可配置 system prompt / model / temperature / tools 的通用 AI Agent
 */
@Entity(tableName = "novel_agents")
data class AgentEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val description: String = "",
    val systemPrompt: String = "",
    val modelId: String = "",        // 关联 NovelModelConfig id
    val temperature: Float = 0.7f,
    val maxTokens: Int = 2048,
    val enabledTools: String = "",   // 逗号分隔工具名
    val enabled: Boolean = true,
    @SerializedName("isBuiltIn")
    val isBuiltIn: Boolean = false,  // 内置不可删
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
