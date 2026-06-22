# 思维链 UI 代码集成方案

## 概述

本方案详细说明如何从上游 Operit 项目获取思维链 UI 代码，并集成到网文写作 IDE 中。

---

## 1. 找到的文件列表

### 核心文件

| 文件路径 | 功能描述 | 大小 |
|---------|---------|------|
| `com/ai/assistance/operit/ui/features/chat/components/part/CustomXmlRenderer.kt` | 自定义 XML 渲染器，支持思维链渲染 | 62.26 KB |
| `com/ai/assistance/operit/ui/features/chat/components/style/bubble/BubbleAiMessageComposable.kt` | AI 消息气泡组件，集成思维链显示 | 30.94 KB |
| `com/ai/assistance/operit/ui/features/chat/components/part/ThinkToolsXmlNodeGrouper.kt` | 思维链和工具调用的分组逻辑 | 16.66 KB |
| `com/ai/assistance/operit/util/ChatUtils.kt` | 聊天工具类，包含思维内容提取逻辑 | 15.29 KB |

### 辅助文件

| 文件路径 | 功能描述 |
|---------|---------|
| `com/ai/assistance/operit/ui/common/markdown/StreamMarkdownRenderer.kt` | 流式 Markdown 渲染器 |
| `com/ai/assistance/operit/ui/common/markdown/XmlContentRenderer.kt` | XML 内容渲染器接口 |
| `com/ai/assistance/operit/ui/common/markdown/XmlRenderPluginRegistry.kt` | XML 渲染插件注册表 |
| `com/ai/assistance/operit/util/ChatMarkupRegex.kt` | 聊天标记正则表达式 |
| `com/ai/assistance/operit/data/preferences/UserPreferencesManager.kt` | 用户偏好管理器 |

---

## 2. 需要集成的代码片段

### 2.1 思维链渲染核心逻辑（CustomXmlRenderer.kt）

**关键功能**：
- 渲染 `<think>` 和 `<thinking>` 标签内容
- 支持思维过程的展开/折叠
- 流式思维内容显示
- 思维链动画效果

**核心代码**：
```kotlin
// 渲染 <think> 和 <thinking> 标签内容
@Composable
private fun renderThinkContent(
    content: String,
    modifier: Modifier,
    textColor: Color,
    xmlStream: Stream<String>?
) {
    val tagName = if (content.contains("<thinking")) "thinking" else "think"
    
    // 检测思维过程是否正在进行
    val isThinkingInProgress = (xmlStream != null) && !isXmlFullyClosed(content)
    
    // 思维标题颜色和动画
    val thinkingTitleBaseColor = textColor.copy(alpha = 0.7f)
    val thinkingTitleShimmerShiftPx = if (isThinkingInProgress) {
        // 流式动画效果
        // ...
    } else {
        null
    }
    
    // 展开/折叠状态管理
    var expanded by remember { mutableStateOf(initialThinkingExpanded) }
    
    // 渲染思维内容
    Column(modifier = modifier) {
        // 可点击的标题行
        CanvasExpandableHeaderRow(
            title = "思考过程",
            expanded = expanded,
            onClick = { expanded = !expanded }
        )
        
        // 动画显示/隐藏思维内容
        AnimatedVisibility(visible = expanded) {
            // 渲染思维内容
            StreamMarkdownRenderer(
                content = thinkText,
                textColor = textColor.copy(alpha = 0.6f)
            )
        }
    }
}
```

### 2.2 思维内容提取逻辑（ChatUtils.kt）

**关键功能**：
- 提取 `<think>` 标签内的内容
- 移除思维标签，保留正文
- 支持未闭合标签处理

**核心代码**：
```kotlin
/**
 * 提取think标签内的内容
 * @param content 包含think标签的内容
 * @return Pair(移除think标签后的内容, think标签内的内容)
 */
fun extractThinkingContent(content: String): Pair<String, String> {
    val thinkPattern = "<think(?:ing)?>([\\s\\S]*?)</think(?:ing)?>".toRegex(RegexOption.DOT_MATCHES_ALL)
    val thinkMatches = thinkPattern.findAll(content)
    
    // 收集所有think标签内的内容
    val thinkingContent = thinkMatches.joinToString("\n") { it.groupValues[1].trim() }
    
    // 移除think标签和search标签
    val contentWithoutThink = content
        .replace(thinkPattern, "")
        .replace("<search>.*?(</search>|\\z)".toRegex(RegexOption.DOT_MATCHES_ALL), "")
        .trim()
    
    return Pair(contentWithoutThink, thinkingContent)
}

/**
 * 过滤掉内容中的思考部分和搜索来源
 */
fun removeThinkingContent(content: String): String {
    val thinkPattern = "<think(?:ing)?>.*?(</think(?:ing)?>|\\z)".toRegex(RegexOption.DOT_MATCHES_ALL)
    val searchPattern = "<search>.*?(</search>|\\z)".toRegex(RegexOption.DOT_MATCHES_ALL)
    return content.replace(thinkPattern, "").replace(searchPattern, "").trim()
}
```

### 2.3 思维链分组逻辑（ThinkToolsXmlNodeGrouper.kt）

**关键功能**：
- 将思维链和工具调用分组
- 支持折叠/展开分组
- 智能识别相关节点

**核心代码**：
```kotlin
class ThinkToolsXmlNodeGrouper(
    private val showThinkingProcess: Boolean,
    private val forceExpandGroups: Boolean = false,
    private val toolCollapseMode: ToolCollapseMode = ToolCollapseMode.ALL
) : MarkdownNodeGrouper {

    override fun group(nodes: List<MarkdownNodeStable>, rendererId: String): List<MarkdownGroupedItem> {
        val out = ArrayList<MarkdownGroupedItem>(nodes.size)
        var i = 0
        
        while (i < nodes.size) {
            val node = nodes[i]
            
            if (node.type != MarkdownProcessorType.XML_BLOCK) {
                out.add(MarkdownGroupedItem.Single(i))
                i++
                continue
            }
            
            val tag = extractXmlTagName(node.content)
            
            // 识别思维链标签
            if (showThinkingProcess && (tag == "think" || tag == "thinking")) {
                // 查找后续的工具调用节点
                var j = i + 1
                var toolCount = 0
                
                while (j < nodes.size) {
                    val next = nodes[j]
                    val nextTag = extractXmlTagName(next.content)
                    
                    // 检查是否为工具调用
                    if (nextTag == "tool" || nextTag == "tool_result") {
                        toolCount++
                        j++
                    } else {
                        break
                    }
                }
                
                // 创建分组
                if (toolCount > 0) {
                    out.add(MarkdownGroupedItem.Group(
                        startIndex = i,
                        endIndexInclusive = j - 1,
                        stableKey = "think-tools-$i"
                    ))
                    i = j
                    continue
                }
            }
            
            out.add(MarkdownGroupedItem.Single(i))
            i++
        }
        
        return out
    }
}
```

### 2.4 气泡组件集成（BubbleAiMessageComposable.kt）

**关键功能**：
- 集成思维链渲染
- 配置思维链显示选项
- 处理用户偏好

**核心代码**：
```kotlin
@Composable
fun BubbleAiMessageComposable(
    message: ChatMessage,
    backgroundColor: Color,
    textColor: Color,
    initialThinkingExpanded: Boolean = false,
    allowExpandedThinkingFullHeight: Boolean = false,
    expandThinkToolsGroups: Boolean = false,
    forceShowThinkingProcess: Boolean = false,
    // ... 其他参数
) {
    val preferencesManager = remember { UserPreferencesManager.getInstance(context) }
    val showThinkingProcess by preferencesManager.showThinkingProcess.collectAsState(initial = true)
    val effectiveShowThinkingProcess = if (forceShowThinkingProcess) true else showThinkingProcess
    
    // 创建 XML 渲染器
    val xmlRenderer = remember(
        effectiveShowThinkingProcess,
        showStatusTags,
        initialThinkingExpanded,
        allowExpandedThinkingFullHeight,
        enableDialogs
    ) {
        CustomXmlRenderer(
            showThinkingProcess = effectiveShowThinkingProcess,
            showStatusTags = showStatusTags,
            initialThinkingExpanded = initialThinkingExpanded,
            allowExpandedThinkingFullHeight = allowExpandedThinkingFullHeight,
            enableDialogs = enableDialogs
        )
    }
    
    // 创建节点分组器
    val nodeGrouper = remember(effectiveShowThinkingProcess, toolCollapseMode, expandThinkToolsGroups) {
        ThinkToolsXmlNodeGrouper(
            showThinkingProcess = effectiveShowThinkingProcess,
            forceExpandGroups = expandThinkToolsGroups,
            toolCollapseMode = toolCollapseMode
        )
    }
    
    // 使用 StreamMarkdownRenderer 渲染消息
    StreamMarkdownRenderer(
        content = message.content,
        xmlRenderer = xmlRenderer,
        nodeGrouper = nodeGrouper,
        // ... 其他参数
    )
}
```

---

## 3. 实现方案

### 3.1 集成步骤

#### 步骤 1：创建网文写作 IDE 的思维链组件目录

```
AIGC-NetNov/app/src/main/java/com/ai/assistance/novelide/ui/features/chat/
├── components/
│   ├── thinking/
│   │   ├── NovelThinkingRenderer.kt      # 思维链渲染器
│   │   ├── ThinkingContentExtractor.kt   # 思维内容提取器
│   │   └── ThinkingNodeGrouper.kt        # 思维节点分组器
│   └── ...
```

#### 步骤 2：适配上游代码

**需要修改的内容**：
1. 包名适配：将 `com.ai.assistance.operit` 改为 `com.ai.assistance.novelide`
2. 依赖适配：移除 Operit 特有的依赖
3. 功能裁剪：移除与网文写作无关的功能（如工具调用、搜索等）
4. UI 优化：根据网文写作场景优化 UI 设计

**适配后的文件结构**：
```kotlin
package com.ai.assistance.novelide.ui.features.chat.components.thinking

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color

/**
 * 网文写作 IDE 的思维链渲染器
 * 基于 Operit 项目的 CustomXmlRenderer 适配
 */
class NovelThinkingRenderer(
    private val showThinkingProcess: Boolean = true,
    private val initialThinkingExpanded: Boolean = false
) {
    @Composable
    fun RenderThinkingContent(
        content: String,
        modifier: Modifier,
        textColor: Color
    ) {
        // 提取思维内容
        val (mainContent, thinkingContent) = extractThinkingContent(content)
        
        if (thinkingContent.isEmpty()) return
        
        var expanded by remember { mutableStateOf(initialThinkingExpanded) }
        
        Column(modifier = modifier) {
            // 思维链标题
            ThinkingHeader(
                title = "思考过程",
                expanded = expanded,
                onClick = { expanded = !expanded }
            )
            
            // 思维链内容
            AnimatedVisibility(visible = expanded) {
                ThinkingBody(
                    content = thinkingContent,
                    textColor = textColor.copy(alpha = 0.6f)
                )
            }
        }
    }
    
    private fun extractThinkingContent(content: String): Pair<String, String> {
        val thinkPattern = "<think(?:ing)?>([\\s\\S]*?)</think(?:ing)?>".toRegex(RegexOption.DOT_MATCHES_ALL)
        val thinkMatches = thinkPattern.findAll(content)
        
        val thinkingContent = thinkMatches.joinToString("\n") { it.groupValues[1].trim() }
        val contentWithoutThink = content.replace(thinkPattern, "").trim()
        
        return Pair(contentWithoutThink, thinkingContent)
    }
}

@Composable
private fun ThinkingHeader(
    title: String,
    expanded: Boolean,
    onClick: () -> Unit
) {
    // 实现思维链标题组件
    // ...
}

@Composable
private fun ThinkingBody(
    content: String,
    textColor: Color
) {
    // 实现思维链内容组件
    // ...
}
```

#### 步骤 3：集成到网文写作 IDE

**修改文件**：
1. `NovelNativeBridge.kt` - 添加思维链相关方法
2. `ChatMessage.kt` - 扩展消息模型支持思维链
3. `ChatScreen.kt` - 集成思维链组件

**集成代码**：
```kotlin
// 在 NovelNativeBridge.kt 中添加
@JavascriptInterface
fun extractThinkingContent(content: String): String {
    val (mainContent, thinkingContent) = NovelThinkingRenderer.extractThinkingContent(content)
    return gson.toJson(mapOf(
        "mainContent" to mainContent,
        "thinkingContent" to thinkingContent
    ))
}
```

#### 步骤 4：添加用户偏好设置

**在 UserPreferencesManager 中添加**：
```kotlin
val showThinkingProcess: Flow<Boolean> = dataStore.data.map { preferences ->
    preferences[SHOW_THINKING_PROCESS] ?: true
}

val initialThinkingExpanded: Flow<Boolean> = dataStore.data.map { preferences ->
    preferences[INITIAL_THINKING_EXPANDED] ?: false
}
```

### 3.2 功能裁剪

**移除的功能**：
1. 工具调用相关代码（`tool`、`tool_result` 标签）
2. 搜索内容相关代码（`search` 标签）
3. 状态标签相关代码（`status` 标签）
4. HTML 内容渲染（`html` 标签）
5. Mood 标签（`mood` 标签）

**保留的功能**：
1. 思维链渲染（`think`、`thinking` 标签）
2. 流式内容显示
3. 展开/折叠动画
4. 用户偏好设置

### 3.3 UI 优化

**针对网文写作场景的优化**：
1. 简化思维链标题，使用中文"思考过程"
2. 优化思维链内容的字体大小和颜色
3. 添加思维链完成状态的视觉反馈
4. 支持思维链内容的复制功能

---

## 4. 测试计划

### 4.1 单元测试

**测试文件**：
- `NovelThinkingRendererTest.kt`
- `ThinkingContentExtractorTest.kt`

**测试用例**：
1. 测试思维内容提取
2. 测试未闭合标签处理
3. 测试空内容处理
4. 测试多个思维块处理

### 4.2 集成测试

**测试场景**：
1. 测试思维链在消息中的显示
2. 测试展开/折叠功能
3. 测试流式思维内容显示
4. 测试用户偏好设置

### 4.3 UI 测试

**测试要点**：
1. 测试思维链标题样式
2. 测试思维链内容样式
3. 测试动画效果
4. 测试响应式布局

---

## 5. 时间估算

| 任务 | 工作量（小时） |
|-----|--------------|
| 代码适配和裁剪 | 8 |
| UI 组件开发 | 12 |
| 集成到现有代码 | 6 |
| 用户偏好设置 | 4 |
| 单元测试 | 4 |
| 集成测试 | 4 |
| UI 测试 | 4 |
| **总计** | **42（5.5 天）** |

---

## 6. 风险与缓解措施

### 风险 1：上游代码依赖复杂
**缓解措施**：
- 详细分析依赖关系
- 逐步迁移，先迁移核心逻辑
- 使用接口抽象，降低耦合

### 风险 2：性能问题
**缓解措施**：
- 优化思维内容提取算法
- 使用懒加载和虚拟滚动
- 缓存处理结果

### 风险 3：兼容性问题
**缓解措施**：
- 保持向后兼容
- 添加版本控制
- 提供降级方案

---

## 7. 交付物

1. 思维链渲染组件代码
2. 思维内容提取工具类
3. 集成到现有代码的修改
4. 单元测试代码
5. 集成测试代码
6. 技术文档

---

## 附录

### 参考文件路径

**上游项目**：
- `d:\工作区\项目\上游项目 Operit-main\Operit-main\app\src\main\java\com\ai\assistance\operit\ui\features\chat\components\part\CustomXmlRenderer.kt`
- `d:\工作区\项目\上游项目 Operit-main\Operit-main\app\src\main\java\com\ai\assistance\operit\ui\features\chat\components\style\bubble\BubbleAiMessageComposable.kt`
- `d:\工作区\项目\上游项目 Operit-main\Operit-main\app\src\main\java\com\ai\assistance\operit\ui\features\chat\components\part\ThinkToolsXmlNodeGrouper.kt`
- `d:\工作区\项目\上游项目 Operit-main\Operit-main\app\src\main\java\com\ai\assistance\operit\util\ChatUtils.kt`

**网文写作 IDE**：
- `d:\工作区\项目\小说软件\AIGC-NetNov\app\src\main\java\com\ai\assistance\novelide\`
