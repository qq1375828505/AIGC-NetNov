# AI-Fic-IDE / Operit 网文写作改造完整规划

> 版本：v3.5（更新项目总体评估，新增已完成工作清单与未完成工作优先级）  
> 作用：本目录下所有分模块规划的最终决策依据。当其他文件与本规划冲突时，以本文件为准。  
> 更新日期：2026-06-22

---

## 一、项目目标与边界

### 1.1 目标
将上游项目 `Operit-main`（Android 通用 AI Agent 平台）改造为专业网文写作 IDE，提取失败项目 `novelIDE-master` 的核心写作能力并迁移到 Operit 架构中。

### 1.2 核心边界
- **不重新造轮子**：复用 Operit 的 AI 对话、模型配置、记忆库、工具系统、工作流、语音、WebView 容器等原生基础设施。
- **不过度侵入原生层**：网文写作的专属业务逻辑优先以 `ToolPkg` 插件包形式承载，原生层仅做最小能力扩展（导航入口、数据桥接、公共目录、数据库表）。
- **UI 复用现有设计稿**：直接使用 `D:\工作区\项目\UI\` 下的 HTML 原型，通过 `NativeBridge` 与原生后端对接。

---

## 二、上游 Operit 架构关键认知

Operit 不是普通 Android App，而是一个**插件化 Agent 平台**：

| 层级 | 技术 | 说明 |
|------|------|------|
| 宿主 | Android + Kotlin + Jetpack Compose | 提供权限、数据库、LLM、语音、WebView、文件系统 |
| JS 运行时 | QuickJS | 运行 ToolPkg 脚本 |
| 插件包 | `.toolpkg`（ZIP + manifest.json） | 功能、UI、工具、工作流、Prompt Hook 的交付单元 |
| 工具系统 | `ToolRegistration` / `Tools.*` | LLM function-calling 与 JS 工具命名空间 |
| 聊天前端 | WebView + React (`web-chat/`) | 也可被 ToolPkg 的 WebView/Compose DSL 替代 |
| 数据层 | Room + ObjectBox | 会话、消息、记忆、工作流等 |

### 2.1 ToolPkg 注册 API（v3.0 补充）

| API | 用途 |
|-----|------|
| `ToolPkg.registerUiRoute(definition)` | 注册 UI 页面路由（route、runtime、screen、title） |
| `ToolPkg.registerNavigationEntry(definition)` | 注册导航入口（surface 字符串、route、title、icon、order） |
| `ToolPkg.registerPromptInputHook(definition)` | 注册 Prompt 输入钩子（注入作品上下文到 AI 对话） |
| `ToolPkg.registerMessageProcessingPlugin(definition)` | 注册消息处理插件（拦截/修改聊天消息） |
| `ToolPkg.readResource(key)` | 读取 ToolPkg 内嵌资源文件 |

参考示例：`examples/sidebar_account_book/src/main.ts`，其中 `surface: "main_sidebar_plugins"` 为字符串。

### 2.2 Screen 注册机制（v3.0 补充）

原生层 `ScreenRouteRegistry` 通过 Kotlin 反射自动发现 `Screen` 子类（`Screen::class.java.declaredClasses`），无需手动注册 Screen 本身。ToolPkg 层使用 `registerUiRoute()` + `registerNavigationEntry()` 注册，不依赖原生的 `hostEntryDefinition`。

**对本次改造的最重要结论**：
 novelIDE 的网文写作功能应该作为 **一个或多个 ToolPkg 插件包** 接入 Operit，而不是把 Operit 原生代码改写成 Flutter 移植版。

---

## 三、novelIDE 核心功能提取（P0/P1/P2）

从 `novelIDE-master` 提取并改造到 Operit 的功能如下：

| 优先级 | 功能 | novelIDE 关键来源 | 改造方式 |
|--------|------|-------------------|----------|
| P0 | 作品 / 卷 / 章节数据模型 | `lib/data/models/novel_model.dart` 等 | Room 实体 + DAO + Repository |
| P0 | 富文本 / 纯文本双编辑器 | `assets/editor/`、`editor_page.dart` | 复制 editor 资源到 ToolPkg resources，WebView 加载 |
| P0 | AI 续写 / 润色 / 精修 | `ai_service.dart`、`agent_tool_executors.dart` | ToolPkg 子包工具调用 Operit `Tools.Chat` |
| P0 | 8 类资料系统（角色/设定/地点/势力/道具/伏笔/参考/待办） | `material_models.dart`、`material_repository.dart` | Room 实体 + ToolPkg CRUD 工具 |
| P1 | 子 Agent 调度（大纲/角色/爽点/水文/标题/去AI味/精修） | `workspace_agent.dart`、`workflow_engine.dart` | ToolPkg 内实现 dispatcher，调用 `Tools.Chat` |
| P1 | 导入导出（TXT/Markdown/JSON/EPUB/DOCX/PDF） | `import_export_service.dart`、导出服务 | ToolPkg `Tools.Files` + 本地解析器 |
| P1 | 番茄钟 + 25 个番茄预设 | `tomato_preset_model.dart`、`tomato_presets_data.dart` | Room 实体 + 预填充数据 + ToolPkg UI |
| P1 | 写作统计 | `stats_repository.dart`、`stats_page.dart` | 读取 Room 聚合数据 |
| P1 | 角色关系图（含事件节点） | `character_relationship.dart` | WebView 画布（vis-network / ECharts） |
| P2 | 语音输入 / 语音通话 | `voice_service.dart`、`voice_call_page.dart` | 复用 Operit 原生语音能力 |
| P2 | 大纲管理 | `outline_page.dart` | ToolPkg 页面 + 工具 |
| P3 | 管理终端（文件/Skill/Agent/Plugin 命令） | `管理终端系统设计.md` | 后续扩展，本期只预留接口 |

---

## 三（附）、上游 Operit 功能与 UI 裁剪对照表

根据 `D:\工作区\项目\UI\` 设计稿和 `审计报告_UI对接.md.html`，对上游 Operit 的功能与页面进行裁剪。原则是：**写小说用不到的一律删除或隐藏；写作核心链路必须保留并对接前端。**

### 3.1 顶层模块 / NDK 子模块

| 上游模块 | 决策 | 理由 |
|----------|------|------|
| `dragonbones/` | **删除** | 2D 骨骼动画，写小说不需要 |
| `fbx/` | **删除** | 3D 模型，无关 |
| `mmd/` | **删除** | 3D 舞蹈动画，无关 |
| `terminal/` | **删除** | Linux 终端，写小说不需要命令行 |
| `showerclient/` | **删除** | 淋浴设备客户端，完全无关 |
| `llama/` | 可选删除 | 本地大模型推理；若只使用在线 API 可删除以减小体积 |
| `mnn/` | 可选删除 | 同上 |
| `quickjs/` | **保留** | ToolPkg JS 运行时必需 |
| `web-chat/` | **删除** | 网页版聊天入口，可被 ToolPkg WebView 替代 |

### 3.2 原生 UI / 功能页面

| 上游页面/功能 | 决策 | 对照 UI/说明 |
|---------------|------|--------------|
| 虚拟形象 / 桌宠 | **删除** | UI 设计稿中没有虚拟形象入口 |
| Web 开发工具 | **删除** | 设计稿无此入口 |
| UI 自动化 (AutoGLM) | **删除** | 写小说不需要自动操作其他 App |
| Tasker 联动 | **删除** | 设计稿无此入口 |
| 系统工具（安装/卸载/设备信息） | **删除** | 与写作无关 |
| Linux 终端页面 | **删除** | `终端.html` 从设计稿中移除，或改为预留占位 |
| AI 对话 | **保留并改造** | `AI聊天.html` / `完整版.html` 已对接，作为写作助手 |
| 助手配置 / 模型配置 | **保留** | 设计稿中设置页包含模型配置 |
| 记忆库 | **保留并改造** | 设计稿有记忆相关页面，可作为写作资料库 |
| 插件市场 | **保留并改造** | `插件市场.html` 保留，但只展示写作相关 Skill/ToolPkg |
| 工具箱 | **保留并改造** | `工具箱.html` 保留，内置写作工具 |
| 工作流 | **保留并改造** | 设计稿中可保留工作流入口，提供码字提醒等 |
| 设置 | **保留并精简** | `设置.html`、`设置界面.html` 保留，删除无关选项 |

### 3.3 设计稿中已包含的网文写作页面（必须实现）

| UI 文件 | 对应功能 | 优先级 |
|---------|----------|--------|
| `网文写作.html` | 我的作品、写作编辑器、资料管理、大纲管理 | P0 |
| `完整版.html` | 主界面导航 + AI 对话 + 网文写作入口 | P0 |
| `导航.html` | 侧边栏导航、网文写作分组 | P0 |
| `AI聊天.html` | AI 对话（已对接） | P0 |
| `工具箱.html` / `工具箱补全.html` | 写作工具集合 | P1 |
| `设置.html` / `设置界面.html` / `设置补全.html` | 应用设置 | P1 |
| `深层界面.html` | 深层思维/模型详情 | P1 |
| `智能体板块.html` | 子 Agent 管理 | P1 |
| `番茄预设管理.html` | 番茄钟与预设 | P1 |
| `角色关系图.html` | 角色关系与事件可视化 | P1 |
| `详情页面.html` | 作品/章节/资料详情 | P1 |
| `附件选择界面.html` | 导入文件选择 | P1 |
| `浏览器.html` | 内置浏览器（查资料用） | P2 |
| `浮动窗口.html` | 悬浮窗快捷操作 | P3 |

### 3.4 设计稿中没有、但写作必需的功能（需要新增/对接）

| 功能 | 说明 | 实现位置 |
|------|------|----------|
| NativeBridge 网文 API | HTML 调用原生读写作品/章节/资料 | `WebUIContainer.kt` |
| 导入导出解析器 | TXT/Markdown/JSON/EPUB/DOCX/PDF | ToolPkg `novel_io.ts` |
| 番茄钟计时服务 | 后台计时 + 通知 | ToolPkg + WorkManager |
| 写作统计聚合 | 按日/周/月统计字数 | ToolPkg `novel_stats.ts` |

---

## 三（附2）、功能裁剪清单

> 基于上游 Operit 通用 AI Agent 平台的完整功能列表，明确标记哪些功能需要从网文写作 IDE 中移除，哪些需要保留。  
> 原则：**与网文写作核心链路无关的功能一律裁剪；写作必需的 AI 能力、数据管理、工具体系全部保留。**

### 3.5 待移除功能模块

| 序号 | 功能模块 | 具体功能项 | 移除原因 |
|------|----------|------------|----------|
| 1 | **系统操作（系统级自动化）** | 安装应用、权限管理 | 与网文写作无关，属于系统管理功能 |
| | | 无障碍 / ADB / Root 三通道自动化 | 同上 |
| | | AutoGLM 自动点击 Agent | 同上 |
| | | adb root 虚拟屏 / 多显示器 | 同上 |
| 2 | **媒体处理** | 视频转换、帧提取 | 网文写作不需要多媒体处理 |
| | | OCR / 图像理解 | 同上 |
| | | 相机拍照 | 同上 |
| | | 音视频读取 | 同上 |
| 3 | **桌宠功能** | WebP 动画支持 | 娱乐功能，与网文写作无关 |
| | | 自定义表情 | 同上 |
| | | 悬浮窗显示 | 同上 |
| 4 | **MCP / Skill 市场** | 一键安装插件 | 网文写作不需要外部插件市场 |
| | | 远程 MCP | 同上 |
| | | 自动描述 | 同上 |
| | | uvx / npx 支持 | 同上 |
| 5 | **权限系统** | 工具级权限控制与安全提示 | 网文写作工具内部不需要权限分级 |
| 6 | **角色互动（部分）** | 角色卡互聊 | 角色扮演功能与网文写作无关 |
| | | 查看历史 | 同上 |
| | | ⚠️ **保留**：思考链折叠 | 属于 AI 对话体验，不影响写作主线 |
| 7 | **角色卡（部分）** | 备份、导出（酒馆 / JSON） | 角色扮演功能与网文写作无关 |
| | | 二维码分享 | 同上 |
| 8 | **首次启动引导页面** | 权限引导欢迎页（PermissionGuideScreen） | 应用启动后直接进入主界面，跳过首次启动引导/欢迎页面 |

### 3.6 保留功能清单（供对照）

| 序号 | 功能模块 | 说明 | 与网文写作的关系 |
|------|----------|------|------------------|
| 1 | **AI 创作** | 续写 / 润色 / 精修 | 核心写作能力，P0 优先级 |
| 2 | **搜索引擎** | 用于资料查找 | 写作调研必需，P1 |
| 3 | **对话管理** | AI 助手对话 | 写作助手交互入口，P0 |
| 4 | **记忆库** | 上下文记忆 | 长篇小说连贯性保障，P0 |
| 5 | **数据统计** | Token 用量统计 | 成本管控，P1 |
| 6 | **全局备份 / 恢复** | 数据安全保障 | 用户数据不丢失，P0 |
| 7 | **工作区绑定** | 文件系统 | 作品文件管理基础，P0 |

### 3.7 裁剪执行说明

1. **代码层面**：上述待移除功能对应的 ToolPkg、Screen、NavItem 在改造时直接跳过，不注册、不打包。
2. **UI 层面**：导航侧边栏不显示上述功能入口；设置页面中隐藏相关选项。
3. **可选模块**：`llama/`、`mnn/` 等本地推理模块视是否使用在线 API 决定是否保留（见 3.1 节）。
4. **部分裁剪**：角色互动与角色卡模块仅移除角色扮演相关子功能，思考链折叠等 AI 对话体验功能保留。

### 3.8 AI 对话思考内容显示功能（待实现）

> **结论：上游 Operit 的思考内容渲染实现无法直接复用。** 当前 HTML 页面均为 UI 设计稿（空壳/模拟数据），未真正对接 LLM 流式响应，`ThoughtRenderer` 组件未集成、`reasoning_content` 解析未接入。改造时需要从零实现完整链路。

#### 3.8.1 上游已有的参考实现（不可直接复用，仅供设计参考）

上游 Operit 原生层具备完整的思考内容处理链路：

| 层级 | 上游组件 | 说明 | 复用可行性 |
|------|----------|------|------------|
| 后端解析 | `ChatUtils.extractThinkingContent()` | 从 `<thinking>` 标签提取思考文本 | 逻辑可参考，需在 ToolPkg JS 层重新实现 |
| 后端清理 | `ChatUtils.removeThinkingContent()` | 清除思考标签 | 同上 |
| Provider 适配 | Deepseek/Kimi/Mimo `reasoning_content` 字段解析 | 各模型流式响应中的思考字段 | 依赖原生 LLM 层，ToolPkg 无法直接调用 |
| Provider 适配 | OpenAI `processContentDelta()` | 流式 reasoning 处理 | 同上 |
| Provider 适配 | Claude `thinking` block type | 原生 thinking block | 同上 |
| 正则 | `ChatMarkupRegex.kt` `thinkTag` | `<thinking>` 标签正则 | 可在 JS 层复用相同正则 |
| 桥接层 | `NovelNativeBridge.chatWithAI()` `thinkingContent` 字段 | 思考内容通过 Bridge 传递 | 需新增对应 NativeBridge 方法 |
| 前端渲染 | 原生 Compose UI 中的思考链折叠 | 原生实现，非 HTML | HTML 层需自行实现 |

#### 3.8.2 需要从零实现的完整链路

**① 后端/桥接层 — 思考内容提取与传递**

```
LLM 流式响应 → 原生层解析 reasoning_content / <thinking> 标签
    → NativeBridge 返回 { thinking: string, content: string } 双字段
    → HTML 前端接收并分别渲染
```

- 在 `NovelNativeBridge.kt` 中新增/扩展 `chatWithAI()` 方法，确保返回数据包含 `thinking` 和 `content` 双字段
- 流式场景下，通过 `StreamToken` 回调分别推送 `thinking` delta 和 `content` delta
- 正则 `/<thinking>([\s\S]*?)<\/thinking>/` 可在 Kotlin 层或 JS 层执行，视流式/非流式而定

**② 前端 — ThoughtRenderer 组件开发**

| 实现项 | 说明 |
|--------|------|
| `ThoughtRenderer` 组件 | 在 `网文写作.html` 和 `完整版.html` 中实现思考内容渲染组件 |
| 折叠/展开交互 | 默认折叠，点击展开查看 AI 思考过程 |
| 流式渲染 | 思考内容随流式响应逐步显示，响应结束后自动折叠 |
| 主题适配 | 思考区域使用半透明背景，适配暗色/亮色主题 |
| 统一集成 | 所有包含 AI 对话的 HTML 页面均需集成 `ThoughtRenderer` |

**③ 涉及页面**

| 页面 | 当前状态 | 改造任务 |
|------|----------|----------|
| `网文写作.html` | 设计稿，无 AI 对话功能 | 实现完整 AI 对话 + ThoughtRenderer |
| `完整版.html` | 设计稿，无真实 LLM 对接 | 同上 |
| `AI聊天.html` | 设计稿 | 同上 |

#### 3.8.3 实现阶段归属

此功能归属**第三阶段：编辑器与 AI（Day 7-9）**，与 AI 写作工具、子 Agent 调度同步实现。具体任务追加如下：

| 任务 | 产出 |
|------|------|
| 扩展 NativeBridge `chatWithAI()` 返回 thinking 双字段 | `NovelNativeBridge.kt` |
| JS 层实现 `<thinking>` 标签正则提取（兜底） | `lib/thinking_parser.ts` |
| 开发 `ThoughtRenderer` HTML 组件 | 折叠/展开、流式渲染、主题适配 |
| 所有 AI 对话页面集成 ThoughtRenderer | `网文写作.html`、`完整版.html`、`AI聊天.html` |

### 3.9 上下文管理功能（待实现）

> **结论：上游 Operit 无上下文管理功能。** novelIDE 的上下文管理（章节上下文、角色上下文、设定上下文）需要从零实现完整链路：后端上下文组装 + 前端选择器 UI。

#### 3.9.1 功能定义

上下文管理允许用户在 AI 对话中手动选择携带哪些背景信息，使 AI 生成内容更贴合当前写作场景。三种上下文类型：

| 类型 | 图标 | 内容 | 使用场景 | 优先级 |
|------|------|------|----------|--------|
| 章节上下文 | 📖 | 当前章节标题、前文摘要、本章已有内容 | 续写、扩写时保持情节连贯 | **P0**（第一阶段） |
| 角色上下文 | 👤 | 角色卡片（名称、性格、背景、关系） | 涉及特定角色的对话/描写生成 | **P1**（第二阶段） |
| 设定上下文 | 📋 | 世界观设定、势力、道具等设定卡 | 确保 AI 生成内容不违反世界观 | **P1**（第二阶段） |

**交互方式**：AI 对话输入框上方显示上下文选择器，用户可勾选/取消各类上下文，已选上下文随消息一起发送给 AI。

#### 3.9.2 上下文组装逻辑详细设计

**① 章节上下文组装（P0）**

组装内容：
- 当前章节标题
- 前文摘要（上一章摘要或手动输入）
- 本章已有内容（最近 500 字）

组装顺序（按重要性排序）：

```
【章节上下文】
章节：第X章 标题
前文摘要：（摘要内容）
本章已有内容：（最近500字）
```

**② 角色上下文组装（P1）**

组装内容：
- 选中角色的完整信息（名称、性格、背景、外貌、关系）

组装顺序：

```
【角色上下文】
- 角色A：（完整角色卡信息）
- 角色B：（完整角色卡信息）
```

**③ 设定上下文组装（P1）**

组装内容：
- 选中的设定卡（世界观、势力、道具等）

组装顺序：

```
【设定上下文】
- 设定A：（完整设定卡信息）
- 设定B：（完整设定卡信息）
```

**④ 完整组装顺序与字符限制**

最终注入到 AI 对话的上下文按以下顺序拼接：

```
1. 章节上下文（P0）
2. 角色上下文（P1）
3. 设定上下文（P1）
4. 用户原始消息
```

**字符限制**：上下文总长度建议控制在 **4000-8000 字符**，避免占用过多 token。超长时自动截断并提示用户精简选择。

#### 3.9.3 需要从零实现的完整链路

**① 后端 — 上下文组装服务**

```
用户选择上下文类型/ID → ToolPkg JS 层调用 NativeBridge 读取对应数据
    → 组装为结构化上下文文本（拼接角色卡、设定卡、章节摘要等）
    → 注入到 AI 对话的 system prompt 或 user message 前缀
    → 发送给 LLM
```

| 实现项 | 文件位置 | 说明 |
|--------|----------|------|
| 上下文组装逻辑 | `src/lib/context_builder.ts` | 将选中的角色/设定/章节数据拼接为结构化文本，控制总长度 4000-8000 字符 |
| 上下文注入 | `PromptInputHook` 或消息拼接 | 通过 ToolPkg `registerPromptInputHook` 注入到对话 |
| 数据读取 | NativeBridge 已有 API | 复用 `getMaterials()`、`getChapterContent()` 等 |

上下文文本模板示例：

```
【章节上下文】
章节：第3章 初入江湖
前文摘要：主角离开师门，来到青云城...
本章已有内容：（最近500字）

【角色上下文】
- 林逸：男，20岁，性格沉稳，武功高强，师从青云派...
- 苏瑶：女，18岁，活泼开朗，林逸的师妹...

【设定上下文】
- 青云派：修仙大派，分内外两门...
- 灵气等级：练气、筑基、金丹、元婴...

【用户消息】
（用户原始输入）
```

**② 前端 — 上下文选择器 UI 组件**

| 实现项 | 说明 |
|--------|------|
| `ContextSelector` 组件 | AI 对话输入框上方的上下文选择器 |
| 类型切换 | 三个 Tab/按钮切换：章节 / 角色 / 设定 |
| 多选勾选 | 角色和设定支持多选（checkbox 列表） |
| 已选展示 | 已选上下文以标签（Tag）形式显示在输入框上方，可点击移除 |
| 快速搜索 | 角色/设定列表支持搜索过滤 |
| 上下文预览 | 点击已选标签可展开预览上下文内容 |
| 主题适配 | 适配暗色/亮色主题 |

**③ 涉及页面**

| 页面 | 当前状态 | 改造任务 |
|------|----------|----------|
| `网文写作.html` | 设计稿，无上下文管理 | 实现 ContextSelector + 上下文组装 |
| `完整版.html` | 设计稿，无真实对接 | 同上 |
| `AI聊天.html` | 设计稿 | 同上 |

#### 3.9.4 与 PromptInputHook 的关系

上游 Operit 提供 `ToolPkg.registerPromptInputHook()` 机制，可在用户发送消息前自动注入上下文。上下文管理功能应利用此机制：

- **自动注入**：通过 PromptInputHook 在每次对话时自动附加用户已选的上下文
- **手动选择**：用户通过 ContextSelector UI 控制注入哪些上下文
- **持久化**：用户的上下文选择偏好保存到 `SharedPreferences` 或 Room，下次打开时恢复

#### 3.9.5 实现阶段归属

此功能归属**第三阶段：编辑器与 AI（Day 7-9）**，与 AI 写作工具、思考内容显示同步实现。按优先级分两批交付：

| 任务 | 优先级 | 产出 |
|------|--------|------|
| 实现章节上下文组装逻辑 | **P0** | `src/lib/context_builder.ts`（章节部分） |
| 注册 PromptInputHook 注入上下文 | **P0** | `main.js` 中注册 |
| 开发 `ContextSelector` HTML 组件（章节 Tab） | **P0** | 章节上下文选择器 |
| 扩展角色上下文组装逻辑 | P1 | `context_builder.ts`（角色部分） |
| 扩展设定上下文组装逻辑 | P1 | `context_builder.ts`（设定部分） |
| ContextSelector 扩展角色/设定 Tab | P1 | 多选、搜索、已选展示 |
| 上下文选择偏好持久化 | P1 | NativeBridge 新增 `saveContextPreference()` / `loadContextPreference()` |
| 所有 AI 对话页面集成 ContextSelector | P1 | `网文写作.html`、`完整版.html`、`AI聊天.html` |

---

## 四、总体改造策略

### 4.1 原生层最小改造清单

| 编号 | 改造项 | 文件位置 | 说明 |
|------|--------|----------|------|
| R1 | 新增导航入口 | `NavItem.kt`、`DrawerContent.kt` | 增加"网文写作"分组，7 个入口 |
| R2 | 新增 Screen 占位/路由 | `ScreenRouteRegistry` | 注册 7 个 novel 路由，统一 `order = 100~160` |
| R3 | 新增 Room 数据库表 | `AppDatabase.kt` + migrations | v20 → v21，新增作品/章节/资料/番茄预设表 |
| R4 | 新增 NativeBridge 方法 | `WebUIContainer.kt` / `NativeBridge.kt` | 暴露给 HTML 的网文写作 API |
| R5 | 公共目录创建 | 启动时初始化 | `/sdcard/Documents/OperitNovel/` |
| R6 | 加载内置 ToolPkg | `assets/packages/` + 初始化逻辑 | 启动时自动安装 `novelide.toolpkg` |
| R7 | 可选：删除无关模块 | `dragonbones/`、`fbx/`、`mmd/`、`terminal/` 等 | 若包体积敏感再执行，非阻塞 |

### 4.2 ToolPkg 插件包结构（novelide.toolpkg）

```
examples/novelide/
├── manifest.json
├── main.js                         # 注册导航、路由、UI、工作流模板
├── src/
│   ├── packages/
│   │   ├── novel_works.ts          # 作品 CRUD
│   │   ├── novel_chapters.ts       # 章节 CRUD
│   │   ├── novel_materials.ts      # 8 类资料 CRUD
│   │   ├── novel_editor.ts         # 编辑器桥接
│   │   ├── novel_ai_tools.ts       # AI 续写/润色/精修
│   │   ├── novel_agents.ts         # 子 Agent 调度
│   │   ├── novel_io.ts             # 导入导出
│   │   └── novel_stats.ts          # 统计查询
│   ├── ui/
│   │   ├── novel_works.ui.ts       # 我的作品
│   │   ├── novel_editor.ui.ts      # 写作编辑器
│   │   ├── novel_materials.ui.ts   # 资料管理
│   │   ├── novel_outline.ui.ts     # 大纲管理
│   │   ├── novel_stats.ui.ts       # 写作统计
│   │   ├── novel_tools.ui.ts       # 写作工具
│   │   └── novel_workspace.ui.ts   # 工作区
│   └── lib/
│       ├── db_bridge.ts            # 封装 NativeBridge DB 调用
│       ├── prompt_templates.ts     # Agent system prompt
│       └── io_parsers.ts           # TXT/MD/JSON/EPUB/DOCX/PDF
├── resources/
│   ├── webapp/                     # HTML UI 资源（从 UI/ 复制）
│   │   ├── index.html
│   │   ├── 完整版.html
│   │   ├── 网文写作.html
│   │   └── ...
│   └── editor/                     # novelIDE 编辑器资源
│       ├── editor.html
│       ├── rich_editor.js
│       └── ...
└── dist/                           # 构建产物
```

### 4.3 UI 实现路径

根据 `审计报告_UI对接.md.html` 的结论：

- `完整版.html` 已经打包进 Android 项目 `assets/web/ui/` 并通过 WebView 加载。
- 目前 AI 对话、会话记录、语音通话、工作区、主题已对接原生；网文写作 10 个页面仍是空壳。
- **改造方式**：
  1. 将 `D:\工作区\项目\UI\` 下的 HTML 整理后作为 ToolPkg resources/webapp/。
  2. 在 `main.js` 中注册 `registerNavigationEntry` 指向 WebView 路由。
  3. 在 `WebUIContainer.kt` 中新增 `NativeBridge` 方法（如 `NB.getNovelWorks`、`NB.saveChapter`）。
  4. HTML 中重写 JS 函数，从 alert/空壳改为调用 `window.NativeBridge`。

---

## 五、关键统一决策

### 5.1 存储架构（唯一决策）

**决策：Room 作为唯一主存储；公共目录仅用于导出、备份、用户可访问附件。**

| 数据类型 | 存储位置 | 说明 |
|----------|----------|------|
| 作品/章节/资料/番茄预设/统计 | Room SQLite | 应用私有目录，主存储 |
| 导入的原始文件 | SAF 选择，不复制 | 解析后直接写入 Room |
| 导出文件 | `/sdcard/Documents/OperitNovel/exports/` | 用户可直接访问 |
| 备份 | `/sdcard/Documents/OperitNovel/backups/` | 用户可直接访问 |
| 记忆附件/关系图数据 | `/sdcard/Documents/OperitNovel/memory/` | 大文件或需要用户查看的数据 |

**废弃**：此前 `03_工作区文件系统.md`、`09b_数据层.md`、`10_系统架构（Kotlin版）.md` 中以 `/sdcard/Operit/novel_workspace/` 为 primary storage 的方案。

#### 5.1.1 工作目录绑定要求（新增）

用户核心诉求：**所有软件产生的数据保存在工作目录里；导入导出用户数据；软件签名固定；卸载后重新安装数据不丢失。**

| 要求 | 实现方式 |
|------|----------|
| **工作目录固定** | 应用首次启动时创建 `/sdcard/Documents/OperitNovel/` 作为工作目录，用户可在设置中更换 |
| **签名固定** | 使用同一套 jks 签名证书发布所有版本，不可更换 |
| **卸载后数据不丢失** | 数据不存应用私有目录，全部存公共目录 `/sdcard/Documents/OperitNovel/` 和 Room（Room 数据库本身在应用私有目录，但需通过导出/备份机制保证可恢复） |
| **导入用户数据** | 支持导入 `.operitbackup` 备份包、TXT/Markdown/JSON/EPUB/DOCX/PDF 作品文件 |
| **导出用户数据** | 支持导出作品为 TXT/Markdown/JSON/EPUB/DOCX/PDF，支持导出完整备份包 |
| **数据绑定机制** | 启动时检测工作目录是否存在，不存在则创建；检测到旧版数据目录时自动迁移 |

**重要说明**：
- Room 数据库本身位于 `/data/data/<package>/databases/`，卸载应用时会被系统删除。
- 为保证卸载后数据不丢失，必须提供**自动备份机制**：应用进入后台、完成关键操作、或定时将 Room 数据库导出到 `/sdcard/Documents/OperitNovel/backups/app_database_backup.db`。
- 重新安装后首次启动，检测到备份文件自动询问是否恢复。
- 章节正文等核心数据可同时以 `.md` 形式写入 `/sdcard/Documents/OperitNovel/works/{work_id}/chapters/`，作为用户可直接访问的副本（非主存储，主存储仍是 Room）。

### 5.2 数据库版本（唯一决策）

**决策：本次改造统一使用 `v20 → v21` 迁移。**

新增表（共 17 张）：
- `novel_works`（作品）
- `novel_volumes`（卷，Chapter 通过 volumeId 关联）
- `novel_chapters`（章节）
- `novel_characters`（角色）
- `novel_settings`（设定）
- `novel_locations`（地点）
- `novel_factions`（势力）
- `novel_items`（道具）
- `novel_plot_hooks`（伏笔）
- `novel_references`（参考资料）
- `novel_todos`（写作待办）
- `novel_writing_skills`（写作技能）
- `novel_setting_reminders`（设定提醒/冲突检测）
- `novel_custom_material_folders`（自定义资料夹）
- `novel_custom_material_items`（自定义资料条目）
- `tomato_presets`（番茄预设）
- `tomato_agents`（番茄Agent，与番茄预设不同）

本改造以 `AppDatabase.kt` 实际 `version=20` 为基线升级到 `v21`。

### 5.3 导航 / Screen Order（唯一决策）

**决策：7 个网文写作 Screen 统一 `order = 100, 110, 120, 130, 140, 150, 160`。**

| Screen | order | route id |
|--------|-------|----------|
| NovelWorksScreen | 100 | `novel_works` |
| NovelEditorScreen | 110 | `novel_editor` |
| NovelMaterialsScreen | 120 | `novel_materials` |
| NovelOutlineScreen | 130 | `novel_outline` |
| NovelStatsScreen | 140 | `novel_stats` |
| NovelToolsScreen | 150 | `novel_tools` |
| NovelWorkspaceScreen | 160 | `novel_workspace` |

`08_屏幕注册.md` 中的 10/20/30... 以及 `09e_UI层.md` 中的其他数值均作废。

**注册方式**：ToolPkg 使用 `ToolPkg.registerNavigationEntry()` + `ToolPkg.registerUiRoute()`，surface 用字符串 `"main_sidebar_plugins"`。详见 `08_屏幕注册.md`。

**可用的 NavigationSurface 枚举值**（`AppNavigationModels.kt:17-23`）：
- `MAIN_SIDEBAR_AI` — AI 助手分组
- `MAIN_SIDEBAR_TOOLS` — 工具分组
- `MAIN_SIDEBAR_PLUGINS` — 插件分组（ToolPkg 默认）
- `MAIN_SIDEBAR_SYSTEM` — 系统分组
- `TOOLBOX` — 工具箱

### 5.4 Chapter 状态值（唯一决策）

**与 novelIDE 对齐**：`unwritten`（未写）/ `draft`（草稿）/ `polishing`（润色中）/ `completed`（已完成）/ `exported`（已导出）。

旧版 `draft/writing/reviewing/completed` 已废弃。

### 5.5 子 Agent ID 统一映射

| 显示名称 | 统一 ID | 别名（不再使用） |
|----------|---------|------------------|
| 大纲生成器 | `outline` | `OutlineGenerator` |
| 角色生成器 | `character` | `CharacterDesigner` |
| 爽点检查 | `pleasure` | `PleasureChecker` |
| 水文检测 | `water` | `WatermarkDetector` |
| 爆款标题 | `title` | `TitleGenerator` |
| 去 AI 味 | `deai` | `DeAiFlavor`、`humanize` |
| 文本精修 | `polish` | `TextPolisher` |

### 5.5 工具集数量与分类

**决策：本次改造实现 48 个写作工具，分为 7 大类。**

详见附录 B。

### 5.6 角色关系图与事件图形系统设计（新增）

用户需求：**角色关系图要呈现 banner 示例图的视觉效果，同时要像 https://www.lddgo.net/chart/character-relationship 那样可编辑、可放大拖动、可下载 SVG/PNG。**

#### 5.6.1 数据源

| 数据类型 | 来源 | 说明 |
|----------|------|------|
| 角色节点 | `novel_characters` 表 | 头像、名称、阵营、重要性 |
| 事件节点 | `novel_plot_hooks` 表 + 新增 `novel_events` 表 | 章节事件、伏笔事件 |
| 关系边 | `novel_character_relationships` 表（新增） | source → target，关系类型、颜色、描述 |
| 事件参与边 | `novel_event_participants` 表（新增） | event → character |
| 布局位置 | `/sdcard/Documents/OperitNovel/memory/works/{work_id}/relationships.json` | 节点坐标持久化 |

#### 5.6.2 新增 Room 表

```kotlin
@Entity(tableName = "novel_character_relationships")
data class CharacterRelationship(
    @PrimaryKey val id: String,
    val workId: String,
    val sourceCharacterId: String,
    val targetCharacterId: String,
    val relationType: String,
    val intensity: Int = 1,          // 关系强度 1-5
    val color: String = "",           // 连线颜色
    val description: String = "",
    val createdAt: Long,
    val updatedAt: Long
)

@Entity(tableName = "novel_events")
data class NovelEvent(
    @PrimaryKey val id: String,
    val workId: String,
    val title: String,
    val description: String = "",
    val chapterId: String? = null,    // 关联章节
    val eventTime: String = "",       // 时间线位置（如"第3章"、"三年前"）
    val eventType: String = "plot",   // plot / flashback / foreshadow
    val createdAt: Long,
    val updatedAt: Long
)

@Entity(tableName = "novel_event_participants")
data class NovelEventParticipant(
    @PrimaryKey val id: String,
    val eventId: String,
    val characterId: String,
    val role: String = ""             // 参与者角色：主角、配角、目击者等
)
```

#### 5.6.3 前端实现方案

**技术选型：WebView + vis-network 或 ECharts Graph**

| 方案 | 优点 | 缺点 |
|------|------|------|
| vis-network | 拖拽、缩放、编辑开箱即用，关系图效果好 | 需要额外引入库 |
| ECharts Graph | 与统计图表统一技术栈，可导出图片 | 交互编辑需自己实现 |
| 自研 Canvas | 完全可控 | 开发成本高 |

**推荐**：**vis-network**，因为：
1. 原生支持节点拖拽、画布缩放、多选、编辑
2. 支持箭头、颜色、分组、层级布局
3. 支持导出为 PNG/SVG
4. 与 banner 示例图的网状关系效果最接近

#### 5.6.4 交互设计

参考 https://www.lddgo.net/chart/character-relationship：

| 操作 | 功能 |
|------|------|
| 滚轮 / 双指捏合 | 缩放画布 |
| 拖拽空白处 | 平移画布 |
| 拖拽节点 | 调整节点位置 |
| 单击节点 | 编辑角色/事件信息 |
| 双击空白处 | 创建新角色节点 |
| 右键菜单 | 添加关系、删除节点、设置阵营 |
| 顶部工具栏 | 切换显示模式（仅角色 / 角色+事件 / 仅事件）、下载 SVG/PNG、自动布局 |
| 侧边面板 | 显示选中节点的详情和关联关系 |

#### 5.6.5 NativeBridge 接口

```typescript
interface RelationshipBridge {
  // 节点
  getGraphNodes(workId: string): Promise<GraphNode[]>;
  createGraphNode(workId: string, node: GraphNode): Promise<string>;
  updateGraphNode(node: GraphNode): Promise<boolean>;
  deleteGraphNode(workId: string, nodeId: string): Promise<boolean>;

  // 关系边
  getGraphEdges(workId: string): Promise<GraphEdge[]>;
  createGraphEdge(workId: string, edge: GraphEdge): Promise<string>;
  updateGraphEdge(edge: GraphEdge): Promise<boolean>;
  deleteGraphEdge(workId: string, edgeId: string): Promise<boolean>;

  // 事件
  getNovelEvents(workId: string): Promise<NovelEvent[]>;
  createNovelEvent(workId: string, event: NovelEvent): Promise<string>;
  updateNovelEvent(event: NovelEvent): Promise<boolean>;
  deleteNovelEvent(workId: string, eventId: string): Promise<boolean>;

  // 布局保存
  saveGraphLayout(workId: string, positions: Record<string, {x:number,y:number}>): Promise<boolean>;
  getGraphLayout(workId: string): Promise<Record<string, {x:number,y:number}>>;

  // 导出
  exportGraphAsSvg(workId: string, svgString: string): Promise<string>;  // 返回保存的公共目录路径
  exportGraphAsPng(workId: string, dataUrl: string): Promise<string>;
}
```

#### 5.6.6 视觉效果要求

参考用户上传的 `relationship-banner.png`：

- 角色节点为圆形头像 + 名称
- 不同阵营使用不同颜色环
- 关系连线使用不同颜色/线型区分（朋友=实线、仇人=红线、情侣=粉线等）
- 重要角色节点更大
- 事件节点为方形/菱形，与角色节点区分
- 整体采用暗色主题，与 Operit UI 风格一致

#### 5.6.7 与 AI 的联动

- 在角色关系图页面选中角色后，可以发送"分析这个角色的人际关系"给 AI
- AI 可以通过工具 `novelide:create_graph_edge` 自动添加关系边
- 完成章节后，AI 可自动提取新角色/新关系，询问是否添加到关系图

---

## 六、分阶段执行计划

### 第一阶段：基础设施（Day 1-3）

| 任务 | 产出 | 负责人/备注 |
|------|------|-------------|
| 创建 `examples/novelide/` ToolPkg 工程骨架 | `manifest.json`、`main.js`、目录结构 | 参考 `examples/sidebar_account_book/` |
| 整理 UI HTML 资源到 ToolPkg | `resources/webapp/` 下完整页面 | 从 `D:\工作区\项目\UI\` 复制 |
| 复制 novelIDE 编辑器资源 | `resources/editor/` | 从 `novelIDE-master/assets/editor/` 复制 |
| 原生层新增 Room 实体与迁移 v20→v21 | `data/models/novel/`、`NovelDao.kt`、`AppDatabase` 升级 | 包含 17 张表 |
| 预填充 25 个番茄预设 | `Migration` 或 `RoomDatabase.Callback` | 见附录 A |

### 第二阶段：数据与工具（Day 4-6）

| 任务 | 产出 |
|------|------|
| 实现 NativeBridge DB 方法 | `NB.getNovelWorks`、`NB.createWork`、`NB.getChapters`、`NB.saveChapter` 等 |
| 实现 8 类资料 CRUD 工具 | `novelide:create_character`、`novelide:update_setting` 等 |
| 实现作品/章节管理工具 | `novelide:create_work`、`novelide:create_chapter`、`novelide:delete_chapter` 等 |
| 对接 HTML 作品列表/章节列表 | 重写 `完整版.html` 相关 JS |

### 第三阶段：编辑器与 AI（Day 7-9）

| 任务 | 产出 |
|------|------|
| WebView 加载 novelIDE editor 资源 | `NovelEditorWebView` / ToolPkg `editor.ui.ts` |
| 实现双编辑器切换 | 纯文本 ↔ 富文本，HTML ↔ Plain 安全转换 |
| 实现 AI 写作工具 | 续写、润色、扩写、去 AI 味、精修 |
| 实现子 Agent 调度 | `NovelAgentDispatcher`，最多 3 轮收敛 |
| 注入作品上下文到 AI 对话 | `PromptInputHook` 或 ToolPkg 内拼接 |

### 第四阶段：资料、大纲、统计、番茄（Day 10-12）

| 任务 | 产出 |
|------|------|
| 资料管理 8 类页面 | HTML 重写 + NativeBridge |
| 大纲管理页面 | 文本编辑器 + 结构化大纲 |
| 写作统计面板 | 字数、时长、速度、目标完成度 |
| 番茄钟 UI + 25 预设 | 计时器 + Agent 联动 |
| 角色关系图与事件图 | WebView 画布，支持节点编辑/拖拽/缩放 |

### 第五阶段：导入导出与收尾（Day 13-15）

| 任务 | 产出 |
|------|------|
| 导入解析器 | TXT/Markdown/JSON/EPUB/DOCX/PDF |
| 导出生成器 | TXT/Markdown/JSON（EPUB/DOCX 二期） |
| SAF 文件选择器封装 | `NB.pickFileToImport`、`NB.pickFolderToExport` |
| 单元/集成测试 | DAO、工具、导入导出、Agent 收敛 |
| 打包 `novelide.toolpkg` | 运行 `sync_example_packages.py` |

---

## 七、NativeBridge 接口清单（前端 ↔ 原生）

### 7.1 作品与章节

```typescript
interface NovelBridge {
  // 作品
  getNovelWorks(): Promise<NovelWork[]>;
  createWork(title: string, genre?: string, description?: string): Promise<string>;
  updateWork(work: NovelWork): Promise<boolean>;
  deleteWork(workId: string): Promise<boolean>;

  // 章节
  getChapters(workId: string): Promise<Chapter[]>;
  createChapter(workId: string, title: string, order?: number): Promise<string>;
  getChapterContent(chapterId: string): Promise<string>;
  saveChapterContent(chapterId: string, content: string, wordCount: number): Promise<boolean>;
  deleteChapter(chapterId: string): Promise<boolean>;
  reorderChapters(workId: string, chapterIds: string[]): Promise<boolean>;
}
```

### 7.2 8 类资料

```typescript
interface MaterialsBridge {
  getMaterials(workId: string, type: MaterialType): Promise<Material[]>;
  createMaterial(workId: string, type: MaterialType, data: object): Promise<string>;
  updateMaterial(type: MaterialType, data: object): Promise<boolean>;
  deleteMaterial(type: MaterialType, id: string): Promise<boolean>;
}
```

### 7.3 AI 与工具

```typescript
interface AiBridge {
  sendNovelAiMessage(message: string, workId?: string, toolNames?: string[]): Promise<StreamToken>;
  callTool(toolName: string, params: object): Promise<ToolResult>;
  dispatchSubAgent(agentId: string, task: string, workId?: string): Promise<string>;
}
```

### 7.4 导入导出与文件

```typescript
interface IoBridge {
  pickFileToImport(mimeType?: string): Promise<{ uri: string; name: string } | null>;
  pickFolderToExport(): Promise<string | null>;
  importFile(uri: string, fileName: string, workId?: string): Promise<ImportResult>;
  exportWork(workId: string, format: 'txt'|'md'|'json', uri?: string): Promise<boolean>;
}
```

### 7.5 角色关系图与事件图

```typescript
interface RelationshipBridge {
  // 角色/事件节点
  getGraphNodes(workId: string): Promise<GraphNode[]>;
  createGraphNode(workId: string, node: GraphNode): Promise<string>;
  updateGraphNode(node: GraphNode): Promise<boolean>;
  deleteGraphNode(workId: string, nodeId: string): Promise<boolean>;

  // 关系边
  getGraphEdges(workId: string): Promise<GraphEdge[]>;
  createGraphEdge(workId: string, edge: GraphEdge): Promise<string>;
  updateGraphEdge(edge: GraphEdge): Promise<boolean>;
  deleteGraphEdge(workId: string, edgeId: string): Promise<boolean>;

  // 事件
  getNovelEvents(workId: string): Promise<NovelEvent[]>;
  createNovelEvent(workId: string, event: NovelEvent): Promise<string>;
  updateNovelEvent(event: NovelEvent): Promise<boolean>;
  deleteNovelEvent(workId: string, eventId: string): Promise<boolean>;

  // 事件参与者
  getEventParticipants(eventId: string): Promise<NovelEventParticipant[]>;
  addEventParticipant(eventId: string, characterId: string, role?: string): Promise<boolean>;
  removeEventParticipant(eventId: string, characterId: string): Promise<boolean>;

  // 布局保存
  saveGraphLayout(workId: string, positions: Record<string, {x:number,y:number}>): Promise<boolean>;
  getGraphLayout(workId: string): Promise<Record<string, {x:number,y:number}>>;

  // 导出
  exportGraphAsSvg(workId: string, svgString: string): Promise<string>;
  exportGraphAsPng(workId: string, dataUrl: string): Promise<string>;
}

interface GraphNode {
  id: string;
  workId: string;
  type: 'character' | 'event';
  label: string;
  avatar?: string;          // 头像路径/URL
  group?: string;           // 阵营/分组
  size?: number;
  x?: number;
  y?: number;
  data?: object;            // 关联的 character / event 完整数据
}

interface GraphEdge {
  id: string;
  workId: string;
  sourceId: string;
  targetId: string;
  label: string;            // 关系名称
  color?: string;
  dashes?: boolean;         // 虚线
  width?: number;
}
```

---

## 八、数据模型精简定义

### 8.1 作品与章节

```kotlin
@Entity(tableName = "novel_works")
data class NovelWork(
    @PrimaryKey val id: String,
    val title: String,
    val genre: String = "",
    val description: String = "",
    val status: String = "ongoing",      // ongoing / completed / paused
    val targetWordCount: Int = 0,
    val currentWordCount: Int = 0,
    val chapterCount: Int = 0,
    val coverPath: String = "",
    val createdAt: Long,
    val updatedAt: Long
)

@Entity(tableName = "novel_chapters")
data class Chapter(
    @PrimaryKey val id: String,
    val workId: String,
    val volumeId: String? = null,
    val title: String,
    val content: String = "",
    val sortOrder: Int = 0,
    val wordCount: Int = 0,
    val status: String = "draft",        // draft / writing / reviewing / completed
    val summary: String? = null,
    val createdAt: Long,
    val updatedAt: Long
)
```

### 8.2 8 类资料（统一字段）

```kotlin
@Entity(tableName = "novel_characters")
data class NovelCharacter(
    @PrimaryKey val id: String,
    val workId: String,
    val name: String,
    val role: String? = null,
    val appearance: String? = null,
    val personality: String? = null,
    val background: String? = null,
    val tags: String = "",               // JSON 数组
    val createdAt: Long,
    val updatedAt: Long
)

// novel_settings、novel_locations、novel_factions、novel_items
// novel_plot_hooks、novel_references、novel_todos 结构类似，详见 04_数据模型.md
```

### 8.3 番茄预设

```kotlin
@Entity(tableName = "tomato_presets")
data class TomatoPreset(
    @PrimaryKey val id: String,
    val name: String,
    val category: String,
    val description: String = "",
    val workMinutes: Int = 25,
    val breakMinutes: Int = 5,
    val icon: String = "",
    val systemPrompt: String = "",
    val tags: String = "",
    val isBuiltin: Boolean = true,
    val createdAt: Long = 0,
    val updatedAt: Long = 0
)
```

---

## 九、风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 现有规划文件存储方案冲突 | 实现混乱 | 以本文件 5.1 节为唯一决策 |
| UI HTML 仍为半成品/空壳 | 需要大量 JS 重写 | 按 4.3 节逐步重写，优先作品/编辑器 |
| Operit ToolPkg API 不熟悉 | 开发阻塞 | 参考 `examples/sidebar_account_book/`、`docs/package_dev/toolpkg.md` |
| 数据库迁移版本冲突 | 用户升级失败 | 统一从 v20 → v21，不再使用 v20 → v21 |
| novelIDE 编辑器资源在 Android WebView 兼容性 | 富文本功能异常 | 先用纯文本兜底，富文本二期完善 |
| 包体积增加 | APK 变大 | 可选删除 dragonbones/fbx/mmd/terminal 等模块 |

---

## 十、文件清单汇总

### 10.1 新增原生文件

```
app/src/main/java/com/ai/assistance/operit/
├── data/model/novel/
│   ├── NovelWork.kt
│   ├── Chapter.kt
│   ├── NovelCharacter.kt
│   ├── NovelSetting.kt
│   ├── NovelLocation.kt
│   ├── NovelFaction.kt
│   ├── NovelItem.kt
│   ├── PlotHook.kt
│   ├── ReferenceMaterial.kt
│   ├── WritingTodo.kt
│   └── TomatoPreset.kt
├── data/dao/novel/
│   └── NovelDao.kt
├── data/repository/novel/
│   └── NovelRepository.kt
└── bridge/
    └── NovelNativeBridge.kt          # 网文写作专用 Bridge 方法
```

### 10.2 新增/修改的原生入口文件

```
app/src/main/java/com/ai/assistance/operit/ui/common/
├── NavItem.kt                          # 追加 7 个 NavItem
└── DrawerContent.kt                    # 追加“网文写作”分组

app/src/main/java/com/ai/assistance/operit/ui/navigation/
└── ScreenRouteRegistry.kt              # 注册 7 个 Screen，order=100~160

app/src/main/java/com/ai/assistance/operit/data/
└── AppDatabase.kt                      # v20 → v21 迁移
```

### 10.3 ToolPkg 插件文件

```
examples/novelide/
├── manifest.json
├── main.js
├── src/packages/*.ts
├── src/ui/*.ui.ts
├── resources/webapp/*.html
└── resources/editor/*
```

---

## 十一、本规划与其他文件的关系

| 文件 | 状态 | 处理方式 |
|------|------|----------|
| `01_NavItem扩展.md` | 已设计 | 保留，但新增入口以本规划 5.3 节为准 |
| `02_侧边栏分组.md` | 已设计 | 保留 |
| `03_工作区文件系统.md` | 冲突 | 以本规划 5.1 节为准，Room 为主存储 |
| `04_数据模型.md` | 基本可用 | 将迁移版本改为 v20 → v21，补 TomatoPreset |
| `05_编辑器WebView.md` | 待实施 | 保留，但改为 ToolPkg resources/editor 加载 |
| `06_多Agent系统.md` | 骨架完成 | 保留，Agent ID 以 5.4 节为准 |
| `07_AI工具注册.md` | 待实施 | 保留，工具清单见附录 B |
| `08_屏幕注册.md` | 占位 | order 改为 100~160 |
| `09b_数据层.md` | 冲突 | 以 Room 方案为准，删除文件系统版 Manager |
| `09c_Agent系统.md` | 骨架 | Agent ID 与存储路径以本规划为准 |
| `09d_工具注册.md` | 示例 | 扩展为完整 48 工具 |
| `09e_UI层.md` | 示例 | 改为基于 HTML + NativeBridge 的实现说明 |
| `10_系统架构（Kotlin版）.md` | 架构参考 | 存储路径以本规划为准 |
| `系统架构图.md` | 参考 | 保留 WebView + 原生后端架构 |
| `语音系统.md` | 参考 | 保留，复用 Operit 原生语音能力 |
| `管理终端系统设计.md` | 后续扩展 | 本期预留接口，不实现 |

---

## 附录 A：25 个番茄预设清单

（与原清单保持一致，预填充到 `tomato_presets` 表）

### A.1 都市流

| ID | 名称 | 标签 |
|----|------|------|
| urban_zhuixu | 都市赘婿·隐忍爆发 | 打脸,身份揭露,情绪反差 |
| urban_shenyi | 都市神医·一针定乾坤 | 医术,救人,打脸,专业感 |
| urban_zhanshen | 都市战神·龙帅归来 | 战神,护短,身份揭露,铁血 |
| xiancheng_zhenxing | 县城振兴·全民分红流 | 县城,振兴,分红,基建 |
| qingxu_fafeng | 情绪发疯·怼人变强流 | 发疯,怼人,情绪价值,系统 |
| changsheng_jiazu | 长生家族·千年底蕴流 | 长生,家族,底蕴,揭秘 |
| dushi_shouye | 都市高武·守夜人流 | 高武,守夜人,热血,异能 |
| zhiye_xt | 职业系统·超能力流 | 职业,系统,超能力,逆袭 |
| moyu_bailan | 摸鱼摆烂·变强流 | 摸鱼,摆烂,系统,打工人 |
| zhibo_nixi | 直播短视频·逆袭流 | 直播,短视频,网红,逆袭 |

### A.2 玄幻流

| ID | 名称 | 标签 |
|----|------|------|
| fantasy_qiandao | 玄幻签到·开局无敌 | 签到,系统,碾压,无敌 |
| fantasy_renwu | 玄幻系统·任务狂魔 | 系统,任务,骚操作,有趣 |
| fantasy_wudi | 玄幻无敌·横推诸天 | 无敌,碾压,横推,爽 |
| xiuxian_zc | 修仙职场·KPI考核流 | 修仙,职场,KPI,摸鱼 |
| tianming_fanpai | 天命反派·背景编辑流 | 反派,背景编辑,天命之子 |
| honghuang_bianji | 洪荒神话·编辑流 | 洪荒,神话,编辑,脑洞 |

### A.3 穿越流

| ID | 名称 | 标签 |
|----|------|------|
| chuanyue_zhongtian | 穿越种田·发家致富 | 种田,温馨,现代知识,日常 |
| chuanyue_niandai | 穿越年代·改革开放 | 年代,改革开放,商机,赚钱 |
| niandai_qinqing | 年代重生·整顿亲情流 | 年代,重生,整顿亲情,极品亲戚 |

### A.4 悬疑流

| ID | 名称 | 标签 |
|----|------|------|
| xuanyi_lingyi | 悬疑灵异·捉鬼天师 | 灵异,悬疑,恐怖,揭秘 |
| xuanyi_daomu | 盗墓探险·寻龙点穴 | 盗墓,探险,风水,宝物 |
| guize_guaitan | 规则怪谈·发疯破局流 | 规则怪谈,无限流,发疯,单元剧 |
| nvxing_xingzhen | 女性悬疑·刑侦流 | 女性,悬疑,刑侦,破案,心理 |

### A.5 女频流

| ID | 名称 | 标签 |
|----|------|------|
| female_gaojian | 无CP大女主·搞钱流 | 大女主,无CP,搞钱,复仇 |
| edu_nvpei | 恶毒女配·全家反派洗白流 | 恶毒女配,洗白,全家反派,打脸 |

---

## 附录 B：48 个 AI 写作工具清单

| 分类 | 工具名 | 说明 |
|------|--------|------|
| **资料管理** | `create_character` / `update_character` / `delete_character` / `list_characters` / `get_character` | 角色卡 CRUD |
| | `create_setting` / `update_setting` / `delete_setting` / `list_settings` / `get_setting` | 设定卡 |
| | `create_location` / `update_location` / `delete_location` / `list_locations` / `get_location` | 地点 |
| | `create_faction` / `update_faction` / `delete_faction` / `list_factions` / `get_faction` | 势力 |
| | `create_item` / `update_item` / `delete_item` / `list_items` / `get_item` | 道具 |
| | `create_hook` / `update_hook` / `delete_hook` / `list_hooks` / `get_hook` | 伏笔 |
| | `create_reference` / `update_reference` / `delete_reference` / `list_references` / `get_reference` | 参考资料 |
| | `create_todo` / `update_todo` / `delete_todo` / `list_todos` | 写作待办 |
| **写作工具** | `polish_text` | 文本精修 |
| | `check_pleasure` | 爽点检查 |
| | `detect_water` | 水文检测 |
| | `generate_title` | 爆款标题 |
| | `deai_flavor` | 去 AI 味 |
| | `continue_writing` | 续写 |
| | `expand_text` | 扩写 |
| **章节工具** | `create_chapter` | 创建章节 |
| | `get_chapter` | 读取章节 |
| | `save_chapter` | 保存章节 |
| | `delete_chapter` | 删除章节 |
| | `reorder_chapters` | 章节排序 |
| **作品工具** | `create_work` | 创建作品 |
| | `get_work` | 读取作品 |
| | `update_work` | 更新作品 |
| | `delete_work` | 删除作品 |
| | `list_works` | 列出作品 |
| **记忆工具** | `query_memory` | 检索记忆 |
| | `save_memory` | 保存记忆 |
| | `link_memory` | 关联记忆 |
| | `summarize_chapter` | 总结章节 |
| **导出工具** | `export_work_txt` | 导出 TXT |
| | `export_work_md` | 导出 Markdown |
| | `export_work_json` | 导出 JSON |
| **导入工具** | `import_file` | 通用导入 |
| **调度工具** | `dispatch_subagent` | 委派子 Agent |
| | `review_chapter` | 审核章节 |
| **关系图工具** | `create_graph_node` | 创建关系图节点 |
| | `update_graph_node` | 更新节点 |
| | `delete_graph_node` | 删除节点 |
| | `create_graph_edge` | 创建关系边 |
| | `update_graph_edge` | 更新关系边 |
| | `delete_graph_edge` | 删除关系边 |
| | `create_novel_event` | 创建事件节点 |
| | `update_novel_event` | 更新事件节点 |
| | `delete_novel_event` | 删除事件节点 |
| | `add_event_participant` | 添加事件参与者 |
| | `remove_event_participant` | 移除事件参与者 |
| | `save_graph_layout` | 保存布局位置 |
| | `export_graph_svg` | 导出关系图 SVG |
| | `export_graph_png` | 导出关系图 PNG |

---

## 附录 C：必读参考文档

- `D:\工作区\项目\UI\审计报告_UI对接.md.html`：UI 对接现状与 Bug 清单
- `D:\工作区\项目\上游项目 Operit-main\Operit-main\docs\package_dev\toolpkg.md`：ToolPkg 注册机制
- `D:\工作区\项目\上游项目 Operit-main\Operit-main\examples\sidebar_account_book\`：本地 Web Server + WebView 最佳实践
- `D:\工作区\项目\失败项目novelIDE-master\novelIDE-master\lib\data\models\`：novelIDE 数据模型来源
- `D:\工作区\项目\失败项目novelIDE-master\novelIDE-master\assets\editor\`：编辑器资源来源

---

## 项目总体评估（更新至 2026-06-22）

### 完成度评估

| 模块 | 完成度 | 说明 |
|------|--------|------|
| 后端数据层 | ~90% | Model/DAO/Repository/NativeBridge 全覆盖 |
| 前端 HTML 层 | ~60% | 核心页面对接，其余为注释占位 |
| ToolPkg 插件层 | ~70% | 66 个工具注册，AI/IO 桥接就绪 |
| CI 构建 | 待验证 | 子模块已注册，待推送验证 |
| **总体完成度** | **约 65-70%** | |

### 当前阻塞项

1. **CI 构建验证** — 子模块已注册，待推送后验证构建结果
2. **IO 桥接实现** — novel_io.ts 当前为 stub，需替换为真正的文件操作

### 待实现核心功能（按优先级）

**P0 — 阻塞性**
- AI 写作工具接口（AiBridge 核心实现）
- WebView 编辑器容器（原生层加载 editor.html）
- 上下文管理（章节上下文组装、PromptInputHook、ContextSelector）
- AI 思考内容显示（ThoughtRenderer 完整链路）

**P1 — 核心功能**
- 8 类资料管理页面重写
- 大纲管理页面
- 写作统计面板
- 番茄钟 UI + 25 预设
- 角色关系图与事件图（vis-network 集成）
- 导入导出解析器（TXT/Markdown/JSON/EPUB/DOCX/PDF）

**P2 — 系统级**
- 功能裁剪物理移除（8 个 NDK 模块目录 + Kotlin 引用）
- 自动备份机制
- NativeBridge 扩展（卷管理/自定义资料夹/写作技能）
- 完整测试套件

### 下一步行动

1. 验证 CI 构建通过
2. 实现 AiBridge 核心接口（sendNovelAiMessage、callTool）
3. 完成 WebView 编辑器容器
4. 实现 ThoughtRenderer 思考内容显示

> 本文档供 AI 协作使用，聚焦架构设计与功能范围，具体实现细节请参考代码提交记录。
