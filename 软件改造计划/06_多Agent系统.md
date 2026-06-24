# 多 Agent 系统

> **状态：⚠️ 已修正 Agent ID** | 统一决策见 `Operit网文写作改造计划.md` 5.4 节
> - 子 Agent ID 统一为：`outline`、`character`、`pleasure`、`water`、`title`、`deai`、`polish`。
> - 调度器应优先在 ToolPkg `novel_agents.ts` 中实现，调用 Operit `Tools.Chat`。
> - 作品/章节上下文通过 Room `NovelRepository` 读取，不再使用 `NovelWorkspaceManager`。
> - 待做：delegate_to_sub_agent 工具调用、审核面板 UI、集成到 Operit 对话流程。

## 子 Agent 定义

```kotlin
// core/agents/novel/NovelSubAgents.kt

sealed class NovelSubAgent(
    val agentId: String,
    val name: String,
    val systemPrompt: String
) {
    object OutlineGenerator : NovelSubAgent(
        "outline", "大纲生成器",
        "你是专业的小说大纲生成专家。根据题材和关键词生成结构清晰的大纲。"
    )
    object CharacterDesigner : NovelSubAgent(
        "character", "角色设计师",
        "你是专业角色设计师。生成包含姓名/定位/外貌/性格/背景的角色卡。"
    )
    object PleasureChecker : NovelSubAgent(
        "pleasure", "爽点检查器",
        "你是网文爽点分析专家。检查爽点密度、节奏、读者期待感。"
    )
    object WatermarkDetector : NovelSubAgent(
        "water", "水文检测器",
        "你是网文质量检测专家。检测凑字数/重复/无意义内容。"
    )
    object TitleGenerator : NovelSubAgent(
        "title", "爆款标题器",
        "你是网文标题专家。生成有悬念感、冲突感的标题。"
    )
    object DeAiFlavor : NovelSubAgent(
        "deai", "去AI味处理器",
        "你是文字润色专家。消除AI机械感，增加口语化和个性化表达。"
    )
    object TextPolisher : NovelSubAgent(
        "polish", "文本精修器",
        "你是专业精修专家。从语病/节奏/文风/冗余/对话/描写/钩子/战力8个维度精修。"
    )
}

## 调度器

```kotlin
class NovelAgentDispatcher(
    private val aiService: AIService,
    private val novelRepository: NovelRepository
) {
    suspend fun dispatch(userRequest: String, workId: String? = null): String {
        // 1. AI 分析任务类型
        val agent = analyzeTaskType(userRequest)
        
        // 2. 构建带上下文的 prompt
        val prompt = buildPrompt(agent, userRequest, workId)
        
        // 3. 多轮推敲（最多3轮）
        var result = ""
        repeat(3) { round ->
            val currentPrompt = if (round == 0) prompt
                else "$prompt\n\n前一轮结果：\n$result\n\n请检查是否有改进空间。"
            result = aiService.chat(currentPrompt)
        }
        return result
    }
    
    private suspend fun analyzeTaskType(request: String): NovelSubAgent {
        val prompt = "判断请求属于哪类：outline/character/pleasure/watermark/title/deai/polish\n请求：$request\n只返回ID"
        val id = aiService.chat(prompt).trim()
        return when (id) {
            "outline" -> NovelSubAgent.OutlineGenerator
            "character" -> NovelSubAgent.CharacterDesigner
            "pleasure" -> NovelSubAgent.PleasureChecker
            "watermark" -> NovelSubAgent.WatermarkDetector
            "title" -> NovelSubAgent.TitleGenerator
            "deai" -> NovelSubAgent.DeAiFlavor
            else -> NovelSubAgent.TextPolisher
        }
    }
    
    private suspend fun buildPrompt(
        agent: NovelSubAgent, task: String, workId: String?
    ): String {
        val sb = StringBuilder()
        sb.appendLine(agent.systemPrompt)
        sb.appendLine()
        
        // 添加作品上下文
        workId?.let { id ->
            novelRepository.getWork(id)?.let { work ->
                sb.appendLine("当前作品：${work.title}（${work.genre}）")
                sb.appendLine("字数：${work.currentWordCount}")
            }
        }
        
        sb.appendLine("任务：$task")
        return sb.toString()
    }
}
```