package com.ai.assistance.novelide.data.agent

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.UUID

/**
 * 通用 AI Agent 仓储
 *
 * - getAll: 首次调用时若表为空则插入 3 个内置 Agent
 * - test: 当前为桩实现（占位返回），后续接 AIProvider
 */
class AgentRepository(private val dao: AgentDao) {

    private val seederMutex = Mutex()
    @Volatile private var seeded: Boolean = false

    /** 取所有 Agent（首次自动 seed 内置） */
    suspend fun getAll(): List<AgentEntity> {
        ensureSeeded()
        return dao.getAll().first()
    }

    /** 仅取所有 Agent（不触发 seed） */
    fun getAllFlow(): Flow<List<AgentEntity>> = dao.getAll()

    suspend fun getById(id: String): AgentEntity? = dao.getById(id)

    /**
     * 新建 Agent
     * @return 已持久化的实体
     */
    suspend fun create(
        name: String,
        description: String = "",
        systemPrompt: String = "",
        modelId: String = "",
        temperature: Float = 0.7f,
        maxTokens: Int = 2048,
        enabledTools: String = "",
        isBuiltIn: Boolean = false
    ): AgentEntity {
        val now = System.currentTimeMillis()
        val entity = AgentEntity(
            id = UUID.randomUUID().toString(),
            name = name,
            description = description,
            systemPrompt = systemPrompt,
            modelId = modelId,
            temperature = temperature,
            maxTokens = maxTokens,
            enabledTools = enabledTools,
            enabled = true,
            isBuiltIn = isBuiltIn,
            createdAt = now,
            updatedAt = now
        )
        dao.insert(entity)
        return entity
    }

    suspend fun update(entity: AgentEntity) {
        dao.update(entity.copy(updatedAt = System.currentTimeMillis()))
    }

    /** 删除 Agent，内置不可删（DAO 层已经加了 isBuiltIn = 0 过滤） */
    suspend fun delete(id: String) {
        dao.delete(id)
    }

    /**
     * 切换 enabled 状态
     * @return 切换后的最新 enabled 值
     */
    suspend fun toggle(id: String, enabled: Boolean): Boolean {
        dao.setEnabled(id, enabled)
        return enabled
    }

    /**
     * 测试 Agent（桩实现）
     * 后续接 AIProvider 后替换为实际调用
     */
    suspend fun test(id: String, input: String): TestResult {
        val agent = dao.getById(id)
            ?: return TestResult(success = false, output = "Agent 不存在", placeholder = true)
        val output = "测试 Agent ${agent.name}：输入 ${input} 已接收"
        return TestResult(success = true, output = output, placeholder = true)
    }

    /** 测试结果 DTO（仅本仓内部使用） */
    data class TestResult(
        val success: Boolean,
        val output: String,
        val placeholder: Boolean = false
    )

    // ==================== 内置 Seeder ====================

    private suspend fun ensureSeeded() {
        if (seeded) return
        seederMutex.withLock {
            if (seeded) return
            val current = dao.getAll().first()
            if (current.isEmpty()) {
                seedBuiltIn()
            }
            seeded = true
        }
    }

    private suspend fun seedBuiltIn() {
        val now = System.currentTimeMillis()
        val builtIns = listOf(
            AgentEntity(
                id = "builtin_polish_expert",
                name = "文笔润色专家",
                description = "对文本进行文学性润色，提升文笔质量与表达力",
                systemPrompt = "你是一位资深的网文编辑兼文笔润色专家。请在保留原作核心情节、人物、风格的前提下，对文本进行文学性润色：优化用词、提升画面感、增强节奏与情绪张力、剔除口语化与 AI 痕迹。润色后输出正文，不要解释。",
                modelId = "",
                temperature = 0.7f,
                maxTokens = 2048,
                enabledTools = "",
                enabled = true,
                isBuiltIn = true,
                createdAt = now,
                updatedAt = now
            ),
            AgentEntity(
                id = "builtin_plot_helper",
                name = "剧情构思助手",
                description = "协助构思主线剧情、支线冲突、伏笔与反转",
                systemPrompt = "你是一位擅长网文结构设计的剧情顾问。围绕用户提供的小说设定、人物、世界观，给出主线推进建议、支线冲突设计、伏笔与反转方案。要求：给出多条候选方案，标注每条方案的爽点密度、节奏张力与风险点。",
                modelId = "",
                temperature = 0.8f,
                maxTokens = 2048,
                enabledTools = "",
                enabled = true,
                isBuiltIn = true,
                createdAt = now,
                updatedAt = now
            ),
            AgentEntity(
                id = "builtin_dialogue_master",
                name = "对话台词大师",
                description = "为角色量身打造个性化、风格化的对话与台词",
                systemPrompt = "你是一位网文对话台词大师，擅长为不同性格、身份、关系亲疏的角色设计差异化台词。请基于用户提供的角色卡、当前情境、情绪基调，生成符合角色身份、口癖、语速、情绪的对话。要求：避免翻译腔、避免 AI 套话、保持网文爽感。",
                modelId = "",
                temperature = 0.75f,
                maxTokens = 2048,
                enabledTools = "",
                enabled = true,
                isBuiltIn = true,
                createdAt = now,
                updatedAt = now
            )
        )
        builtIns.forEach { dao.insert(it) }
    }
}
