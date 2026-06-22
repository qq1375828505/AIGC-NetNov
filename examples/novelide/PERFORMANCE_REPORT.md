# AIGC-NetNov 性能分析报告

> **分析日期**: 2026-06-22  
> **分析范围**: TypeScript 前端 (38 文件) + Kotlin 后端 (NovelNativeBridge.kt, 1653 行)  
> **架构**: WebView + TypeScript Bridge + NativeBridge (Android)

---

## 一、架构概览

```
┌─────────────────────────────────────────────────────────┐
│  Android App (Compose UI)                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  WebView (HTML/TypeScript)                         │  │
│  │  ┌─────────────┐  ┌──────────────┐                │  │
│  │  │ UI Pages    │  │ Lib Layer    │                │  │
│  │  │ (12 pages)  │  │ (7 modules)  │                │  │
│  │  └──────┬──────┘  └──────┬───────┘                │  │
│  │         └────────┬───────┘                         │  │
│  │                  ▼                                  │  │
│  │         window.NativeBridge                         │  │
│  └──────────────────┬────────────────────────────────┘  │
│                     │ @JavascriptInterface (同步)         │
│                     ▼                                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  NovelNativeBridge.kt (95 个 runBlocking 方法)     │  │
│  │  → NovelRepository (Room/Flow)                     │  │
│  │  → SQLite Database                                 │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 二、关键性能指标

| 指标 | 数值 | 风险等级 |
|------|------|----------|
| TypeScript 文件 | 38 | - |
| Kotlin 后端行数 | 1653 | - |
| `runBlocking` 调用 | **95 次** | 🔴 严重 |
| `JSON.parse` 调用 | **~75 次** | 🟡 中等 |
| `setInterval/setTimeout` | 15 次 | 🟡 中等 |
| `NativeBridge` 直接调用 | ~120 次 | 🟡 中等 |
| 全局单例管理器 | 3 个 | 🟡 中等 |
| `.first()` Flow 收集 | 28 次 | 🟡 中等 |

---

## 三、内存泄漏风险 (Memory Leak Detection)

### 3.1 🔴 AgentManager 会话未自动清理

**文件**: `src/lib/agent_manager.ts` (行 134, 399-406)

```typescript
// 问题: sessions Map 只增不减，无自动清理机制
private sessions: Map<string, AgentSession> = new Map();

// cleanupSessions() 存在但从未被自动调用
async cleanupSessions(): Promise<void> {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [id, session] of this.sessions) {
    if (session.lastActiveAt < oneHourAgo) {
      await this.closeSession(id);
    }
  }
}
```

**风险**:
- 每次创建 Agent 会话，Map 新增一条记录
- `history` 数组虽限制 50 条，但会话本身永不释放
- 7 个 Agent × 每个会话含 `terminalSessionId` → 终端资源泄漏
- 全局单例 `globalAgentManager` 生命周期等同 WebView → 跨页面持续增长

**建议**:
```typescript
// 在构造函数中启动自动清理定时器
constructor() {
  this.cleanupInterval = setInterval(() => this.cleanupSessions(), 5 * 60 * 1000);
}

// 析构时清理
dispose() {
  if (this.cleanupInterval) clearInterval(this.cleanupInterval);
  for (const [id] of this.sessions) {
    this.closeSession(id);
  }
}
```

### 3.2 🟡 编辑器自动保存定时器闭包风险

**文件**: `src/ui/novel_editor_page.ts` (行 18, 49-73)

```typescript
let saveTimer: any = null;  // 局部变量，每次渲染重新创建

function autoSave(newContent: string) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    // 闭包捕获 newContent 和 currentChapter
    await window.NativeBridge.saveChapterContent(...);
  }, 3000);
}
```

**风险**:
- `saveTimer` 是函数局部变量，每次组件重新渲染时重置为 `null`
- 如果用户快速切换章节，旧的 `setTimeout` 闭包仍持有旧 `chapterId` 的引用
- 可能导致对已不存在的章节执行保存操作

**建议**:
- 使用 `ctx.useRef` 或 `ctx.useState` 持久化 timer 引用
- 在 `useEffect` 返回的清理函数中清除定时器

### 3.3 🟡 番茄钟 AudioContext 泄漏

**文件**: `src/ui/novel_tomato_page.ts` (行 39-77)

```typescript
function playNotificationSound(type) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  // ...
  setTimeout(() => {
    oscillator.stop();
    audioContext.close();  // 依赖 setTimeout 成功执行
  }, 500);
}
```

**风险**:
- 每次播放音频创建新的 AudioContext 实例
- 如果 `setTimeout` 中的 `close()` 未执行（页面卸载、异常），AudioContext 泄漏
- Android WebView 对 AudioContext 数量有限制（通常 ~6 个）

**建议**:
```typescript
// 复用单个 AudioContext 实例
private audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!this.audioContext || this.audioContext.state === 'closed') {
    this.audioContext = new AudioContext();
  }
  return this.audioContext;
}
```

### 3.4 🟡 SkillManager 全局单例数据冗余

**文件**: `src/lib/skill_manager.ts` (行 430, 63-423)

```typescript
// 全局单例 + 25个硬编码 Skill 配置
let globalSkillManager: SkillManager | null = null;
const TOMATO_SKILLS: SkillConfig[] = [/* 25 个条目 */];
```

**风险**:
- `TOMATO_SKILLS` 数组常驻内存（~15KB 字符串数据）
- `syncFromBackend()` 从后端同步数据后，Map 和数组中存在两份数据
- 全局单例生命周期 = WebView 生命周期

---

## 四、性能瓶颈分析 (Performance Bottleneck)

### 4.1 🔴🔴 runBlocking 阻塞 WebView JavaScript 线程

**文件**: `NovelNativeBridge.kt` (95 处)

这是**最严重的性能问题**。

```kotlin
@JavascriptInterface
fun getNovelWorks(): String {
    return runBlocking(Dispatchers.IO) {  // 阻塞 WebView JS 线程！
        val works = repository.getAllWorks().first()
        gson.toJson(works)
    }
}
```

**问题详解**:
1. `@JavascriptInterface` 方法在 **WebView 的 JavaScript 线程**上同步执行
2. `runBlocking(Dispatchers.IO)` 阻塞该线程，直到 IO 操作完成
3. **所有 95 个方法**都使用此模式
4. 数据库操作（特别是 `.first()` 收集 Flow）可能需要 10-100ms
5. 复合操作（如 `exportWork`）同时查询 5 个表 → 阻塞 200-500ms
6. 用户在 WebView 中操作时，**整个页面冻结**

**影响场景**:
| 操作 | 预估阻塞时间 | 用户感知 |
|------|-------------|----------|
| `getNovelWorks()` | 10-50ms | 轻微卡顿 |
| `getCharacters(workId)` | 10-30ms | 轻微卡顿 |
| `exportWorkJson()` | 100-500ms | **明显卡死** |
| `importFile()` | 200-2000ms | **严重卡死** |
| `getWritingStats()` | 50-200ms | 中等卡顿 |
| `getCustomItems()` (N+1查询) | 100-1000ms | **严重卡死** |

**建议**:
```kotlin
// 方案 A: 使用 evaluateJavascript 回调（推荐）
@JavascriptInterface
fun getNovelWorksAsync(callbackId: String) {
    scope.launch {
        val works = repository.getAllWorks().first()
        val json = gson.toJson(works)
        webView.evaluateJavascript(
            "window.__nativeCallback('$callbackId', $json)", null
        )
    }
}
```

### 4.2 🔴 JSON.parse 性能开销

**影响范围**: `native_bridge_init.ts` (39次), `ui_bridge.js` (14次), `ai_bridge.ts` (6次)

```typescript
// native_bridge_init.ts - 每个方法都执行 JSON.parse
async getNovelWorks(): Promise<any[]> {
  const result = window.NativeBridge.getNovelWorks();
  return JSON.parse(result);  // 同步解析，阻塞主线程
}
```

**问题**:
1. **双重序列化**: Kotlin 对象 → JSON 字符串 → JavaScript JSON.parse → JS 对象
2. 大数据量时 `JSON.parse` 阻塞主线程（10KB 数据约 1-5ms，100KB 约 10-50ms）
3. **无缓存机制**: 每次调用都重新解析，相同数据反复解析

**建议**:
- 实现内存缓存层，避免重复解析相同数据
- 对大数据集使用分页加载
- 考虑使用 LRU Cache 缓存解析结果

### 4.3 🟡 getCustomItems 的 N+1 查询问题

**文件**: `NovelNativeBridge.kt` (行 1097-1111)

```kotlin
fun getCustomItems(workId: String): String {
    return runBlocking(Dispatchers.IO) {
        val folders = repository.getCustomMaterialFoldersByWorkId(workId).first()
        val allItems = mutableListOf<CustomMaterialItem>()
        for (folder in folders) {  // N+1 查询！
            allItems.addAll(
                repository.getCustomMaterialItemsByFolderId(folder.id).first()
            )
        }
        gson.toJson(allItems)
    }
}
```

**问题**:
- 先查询所有文件夹（1次查询），再逐个查询每个文件夹的条目（N次查询）
- 如果有 10 个文件夹，总共 11 次数据库查询
- 每次查询都通过 `.first()` 收集完整 Flow

**建议**:
```kotlin
// 在 Repository 层添加单次查询方法
@Query("SELECT * FROM custom_material_items WHERE folderId IN (SELECT id FROM custom_material_folders WHERE workId = :workId)")
fun getCustomItemsByWorkId(workId: String): Flow<List<CustomMaterialItem>>
```

### 4.4 🟡 reorderChapters 逐条更新

**文件**: `NovelNativeBridge.kt` (行 175-192)

```kotlin
fun reorderChapters(workId: String, chapterIdsJson: String): String {
    return runBlocking(Dispatchers.IO) {
        val chapterIds = gson.fromJson(chapterIdsJson, Array<String>::class.java).toList()
        chapterIds.forEachIndexed { index, chapterId ->
            val chapter = repository.getChapterById(chapterId)  // N 次查询
            if (chapter != null) {
                repository.updateChapter(chapter.copy(sortOrder = index))  // N 次更新
            }
        }
    }
}
```

**问题**: 章节数量 × 2 次数据库操作（查询+更新）

**建议**: 使用事务批量更新
```kotlin
@Transaction
fun reorderChapters(workId: String, chapterIds: List<String>) {
    chapterIds.forEachIndexed { index, id ->
        updateChapterSortOrder(id, index)
    }
}
```

---

## 五、资源使用分析 (Resource Usage)

### 5.1 🟡 WebView 内存开销

**文件**: `src/ui/novel_editor_page.ts` (行 149-157)

```typescript
UI.WebView({
  key: `editor_${currentChapter.id}`,
  url: `file:///android_asset/packages/novelide/resources/webapp/editor.html?chapterId=${currentChapter.id}`,
  javaScriptEnabled: true,
  domStorageEnabled: true,
  allowFileAccess: true
})
```

**问题**:
1. 每次切换章节，WebView 组件因 key 变化而**完全重建**
2. 新 WebView 需要初始化 JS 引擎、加载 HTML、执行脚本
3. 旧 WebView 需要等待 GC 回收（Android WebView 内存释放有延迟）
4. 预估每个 WebView 实例占用 **10-30MB 内存**

**建议**:
- 复用 WebView 实例，通过 JavaScript 桥接切换内容
- 使用 `evaluateJavascript` 动态更新编辑器内容，而非重建 WebView
- 考虑使用 `WebViewPool` 预创建和复用

### 5.2 🟡 ThoughtRenderer DOM 效率

**文件**: `src/lib/thought_renderer.ts` (行 89-109)

```typescript
static renderThinkingHtml(thinkingContent: string, expanded: boolean = false): string {
  const contentId = `thinking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return `
    <div class="thinking-container" ...>
      <div onclick="const el = document.getElementById('${contentId}'); 
           el.style.display = el.style.display === 'none' ? 'block' : 'none';">
  `;
}
```

**问题**:
1. 每次渲染生成带随机 ID 的 HTML 片段
2. 使用内联 `onclick` 事件处理器（字符串拼接 JavaScript）
3. `escapeHtml` 方法逐字符替换，长文本时效率低
4. 无虚拟滚动，大量消息时 DOM 节点膨胀

**建议**:
- 使用事件委托替代内联事件处理器
- 对长文本使用 `textContent` 替代 `innerHTML`
- 实现消息虚拟列表

### 5.3 🟡 大量数据的全量加载

所有资料查询都是一次性加载全部数据：
```typescript
// novel_materials_page.ts
const result = await window.NativeBridge.getCharacters(workId);
setCharacters(JSON.parse(result));  // 全量加载
```

**建议**:
- 实现分页加载（每页 20-50 条）
- 使用 `useMemo` 缓存已加载数据
- 实现数据预加载和缓存策略

---

## 六、架构级问题

### 6.1 🔴 三重桥接层冗余

当前存在三个桥接层，职责高度重叠：

| 桥接层 | 文件 | 方法数 |
|--------|------|--------|
| `NovelBridge` | `native_bridge_init.ts` | ~60 |
| `NovelDBBridge` | `db_bridge.ts` | ~15 |
| `NovelUI` | `ui_bridge.js` | ~15 |

三个层都做相同的事：调用 `window.NativeBridge.xxx()` → `JSON.parse()` → 返回结果。

**问题**: 代码重复，维护成本高；三份 JSON.parse 逻辑不一致时产生 bug；包体积浪费。

**建议**: 统一为一个桥接层，使用 TypeScript 编写，自动生成类型声明。

### 6.2 🟡 缺少错误边界和重试机制

```typescript
// ai_bridge.ts - 错误直接抛出
async function callAi(systemPrompt: string, prompt: string): Promise<string> {
  const result = await Tools.Chat.sendMessage(fullMessage);
  if (!result) throw new Error("AI 调用失败");
}
```

**建议**:
- 实现指数退避重试（最多 3 次）
- 添加错误边界 UI 组件
- 实现离线队列，网络恢复后自动提交

---

## 七、优化建议汇总

### 优先级 P0 (必须修复)

| # | 问题 | 影响 | 修复方案 | 预估工作量 |
|---|------|------|----------|-----------|
| 1 | runBlocking 阻塞 JS 线程 (95处) | 页面卡死/ANR | 改用异步回调模式 | 3-5 天 |
| 2 | AgentManager 会话泄漏 | 内存持续增长 | 添加自动清理定时器 | 0.5 天 |

### 优先级 P1 (建议修复)

| # | 问题 | 影响 | 修复方案 | 预估工作量 |
|---|------|------|----------|-----------|
| 3 | JSON.parse 无缓存 (~75处) | 重复计算开销 | 添加 LRU 缓存层 | 1 天 |
| 4 | getCustomItems N+1 查询 | 数据库性能 | 合并为单次查询 | 0.5 天 |
| 5 | WebView 每次切换重建 | 内存和启动开销 | 复用 WebView 实例 | 2 天 |
| 6 | 三重桥接层冗余 | 维护成本 | 统一为单层 | 1 天 |

### 优先级 P2 (可选优化)

| # | 问题 | 影响 | 修复方案 | 预估工作量 |
|---|------|------|----------|-----------|
| 7 | 编辑器 saveTimer 闭包 | 潜在数据不一致 | 使用 useRef 持久化 | 0.5 天 |
| 8 | AudioContext 泄漏 | 音频资源耗尽 | 复用单例 | 0.5 天 |
| 9 | 全量数据加载 | 首屏慢 | 分页 + 缓存 | 2 天 |
| 10 | reorderChapters 逐条更新 | 数据库性能 | 批量事务更新 | 0.5 天 |
| 11 | SkillManager 数据冗余 | 内存浪费 | 去重 + 延迟加载 | 0.5 天 |
| 12 | ThoughtRenderer DOM 效率 | 渲染性能 | 事件委托 + 虚拟列表 | 1 天 |

---

## 八、结论

AIGC-NetNov 项目的**核心性能瓶颈**在于 Kotlin 后端的 `runBlocking` 同步桥接模式。这是 Android WebView `@JavascriptInterface` 的固有限制——方法必须同步返回，但数据库操作是异步的。

**短期建议**: 在不改变架构的前提下，优化 N+1 查询、添加缓存、修复内存泄漏。

**长期建议**: 将 NativeBridge 改为异步回调模式（通过 `evaluateJavascript` 返回结果），从根本上解决 WebView 线程阻塞问题。

---

*报告生成: performance-benchmarker | novel-dev-team-v2*
