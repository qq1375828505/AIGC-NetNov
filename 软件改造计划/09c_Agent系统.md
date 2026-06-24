# 09c Agent系统

> **状态：⚠️ 已修正 Agent ID 与存储路径** | 统一决策见 `Operit网文写作改造计划.md` 5.4 节
> - 子 Agent ID 必须以统一映射为准：`outline`、`character`、`pleasure`、`water`、`title`、`deai`、`polish`。
> - Agent 调度器应优先在 ToolPkg `novel_agents.ts` 中实现，调用 Operit `Tools.Chat`。
> - 作品/章节上下文通过 Room `NovelRepository` 读取，不再直接读文件系统。

## 步骤 1: 创建子Agent定义

文件路径：`app/src/main/java/com/ai/assistance/operit/core/agents/novel/NovelSubAgents.kt`

```kotlin
package com.ai.assistance.operit.core.agents.novel

sealed class NovelSubAgent(
    val agentId: String,
    val name: String,
    val systemPrompt: String
) {
    object OutlineGenerator : NovelSubAgent("outline", "大纲生成器",
        "你是专业小说大纲生成专家。根据题材和关键词生成结构清晰的大纲，包含故事背景、主线剧情、核心冲突、结局走向。使用Markdown格式。")
    object CharacterDesigner : NovelSubAgent("character", "角色设计师",
        "你是专业角色设计师。生成详细角色设定卡，包含姓名、定位、外貌、性格、背景、人物关系。确保角色有深度和成长空间。")
    object PleasureChecker : NovelSubAgent("pleasure", "爽点检查器",
        "你是网文爽点分析专家。分析文本的爽点密度、节奏感、读者期待感。重点关注升级、打脸、装逼、逆袭等爽点元素。给出具体改进建议。")
    object WatermarkDetector : NovelSubAgent("water", "水文检测器",
        "你是网文质量检测专家。检测文本中凑字数、重复、无意义的内容。标记需要删减或重写的段落。确保每段都有推动剧情或塑造人物的作用。")
    object TitleGenerator : NovelSubAgent("title", "爆款标题器",
        "你是网文标题专家。生成有悬念感、冲突感、好奇心驱动的标题。参考当下流行的网文标题风格。")
    object DeAiFlavor : NovelSubAgent("deai", "去AI味处理器",
        "你是文字润色专家。消除AI生成文本的机械感、模板化表达。增加口语化、个性化、情感化的表达。让文字更像真人写的网文。")
    object TextPolisher : NovelSubAgent("polish", "文本精修器",
        "你是专业精修专家。从8个维度精修文本：1.语病修正 2.节奏调整 3.文风统一 4.冗余删除 5.对话优化 6.描写增强 7.钩子设计 8.战力平衡。逐维度分析并给出修改。")

    companion object {
        fun fromId(id: String): NovelSubAgent = when (id) {
            "outline" -> OutlineGenerator
            "character" -> CharacterDesigner
            "pleasure" -> PleasureChecker
            "water" -> WatermarkDetector
            "title" -> TitleGenerator
            "deai" -> DeAiFlavor
            "polish" -> TextPolisher
            else -> TextPolisher
        }
    }
}
```

## 步骤 2: 创建Agent调度器

文件路径：`app/src/main/java/com/ai/assistance/operit/core/agents/novel/NovelAgentDispatcher.kt`

```kotlin
package com.ai.assistance.operit.core.agents.novel

import com.ai.assistance.operit.api.chat.AIService
import com.ai.assistance.operit.data.repository.novel.NovelRepository

class NovelAgentDispatcher(
    private val aiService: AIService,
    private val novelRepository: NovelRepository
) {
    suspend fun dispatch(userRequest: String, workId: String? = null): String {
        val agent = analyzeTask(userRequest)
        return executeAgent(agent, userRequest, workId)
    }

    private suspend fun analyzeTask(request: String): NovelSubAgent {
        val prompt = """
            分析请求，判断应该交给哪个子Agent处理。只返回agent_id。
            
            请求：$request
            
            可选ID：outline, character, pleasure, water, title, deai, polish
        """.trimIndent()

        val agentId = aiService.chat(prompt).trim().lowercase()
        return NovelSubAgent.fromId(agentId)
    }

    private suspend fun executeAgent(agent: NovelSubAgent, task: String, workId: String?): String {
        val sb = StringBuilder()
        sb.appendLine(agent.systemPrompt)
        sb.appendLine()

        workId?.let { id ->
            novelRepository.getWork(id)?.let { work ->
                sb.appendLine("当前作品：${work.title}（${work.genre}，${work.currentWordCount}字）")
                sb.appendLine()
            }

            val recentChapter = novelRepository.getChapters(id)
                .sortedByDescending { it.updatedAt }
                .firstOrNull()

            recentChapter?.let { chapter ->
                sb.appendLine("最近章节：${chapter.title}（前2000字）")
                sb.appendLine(chapter.content.take(2000))
                sb.appendLine()
            }
        }

        sb.appendLine("任务：$task")

        var result = ""
        var prev = ""
        repeat(3) { round ->
            val prompt = if (round == 0) sb.toString()
            else "${sb.toString()}\n\n前一轮结果：\n$prev\n\n请检查是否有改进空间。"

            result = aiService.chat(prompt)

            if (round > 0 && isConverged(prev, result)) return result
            prev = result
        }
        return result
    }

    private fun isConverged(a: String, b: String): Boolean {
        val len = minOf(a.length, b.length)
        if (len == 0) return false
        var match = 0
        for (i in 0 until len) { if (a[i] == b[i]) match++ }
        return match.toDouble() / len > 0.9
    }
}
```

## 步骤 3: 验证

编译项目，确保没有语法错误。