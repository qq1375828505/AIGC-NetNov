# ToolPkg 与原生层职责对照表

> 文档版本：v1.0 | 更新时间：2026-06-25
> 适用范围：AIGC-NetNov 网文写作 IDE

## 1. 架构总览

```
┌─────────────────────────────────────────────────┐
│              HTML/JS 前端 (WebView)           │
│         网文写作 IDE 用户界面层                │
└──────────────────────┬────────────────────────┘
                       │ @JavascriptInterface
┌──────────────────────▼────────────────────────┐
│        ToolPkg 层（工具包/插件层）            │
│  - 桌面小组件                                  │
│  - 工具注册与发现                               │
│  - DSL 渲染                                   │
└──────────────────────┬────────────────────────┘
                       │ Intent / Binding
┌──────────────────────▼────────────────────────┐
│          原生层（Android Native）              │
│  - NativeBridge (JS ↔ Android)               │
│  - Service (后台服务)                        │
│  - ContentProvider (文件共享)                │
│  - Room 数据库                               │
└───────────────────────────────────────────────┘
```

## 2. 职责对照表

| 功能领域 | ToolPkg 层职责 | 原生层职责 | 交互方式 |
|---------|--------------|------------|---------|
| **桌面小组件** | 小组件 UI 渲染（DSL）、配置 Activity、Host 绑定 | AppWidgetManager 系统回调、定时更新触发 | Android Widget API |
| **工具注册** | 声明工具元数据（name/icon/description）、注册到 ToolRegistry | 读取注册表、按权限过滤、提供给 WebView | AIDL / Binder |
| **JS 调用原生能力** | 不直接调用，通过 Bridge 转发 | 实现 @JavascriptInterface 方法、权限校验、异步回调 | WebView.addJavascriptInterface |
| **数据持久化** | 无直接数据库访问，通过 Repository 接口 | Room DAO 实现、数据库迁移、事务处理 | Repository 接口 |
| **文件操作** | 无直接文件访问，通过 Provider URI | DocumentProvider / WorkspaceProvider、SAF 集成 | ContentProvider URI |
| **AI 对话** | 无直接 API 调用，通过 Bridge 发送消息 | ChatServiceCore 管理会话、API 调用、流式响应 | Service Binding |
| **终端/命令执行** | 无直接进程操作 | TermuxCommandResultService、Session 管理 | Service / Socket |
| **番茄钟** | 无直接计时，UI 展示层 | TimerService、通知管理、音频播放 | Service + Notification |
| **技能/预设管理** | 无直接数据操作 | TomatoPreset / WritingSkill DAO、Seeder | Room DAO |

## 3. ToolPkg 层详细职责

### 3.1 桌面小组件（ToolPkgDesktopWidget*）

| 类 | 职责 |
|----|------|
| `ToolPkgDesktopWidgetHost` | AppWidgetHost 生命周期管理、widget 列表维护 |
| `ToolPkgDesktopWidgetConfigActivity` | 小组件配置界面、参数绑定 |
| `ToolPkgDesktopWidgetDslRenderer` | DSL → RemoteViews 渲染引擎 |
| `ToolPkgDesktopGlanceWidget` | Glance 兼容层（新版 Widget API） |

### 3.2 工具注册（PluginRegistry）

| 接口 | 职责 |
|------|------|
| `PluginRegistry.register()` | 注册工具到全局注册表 |
| `PluginRegistry.getTool()` | 按 ID 获取工具描述 |
| `PluginRegistry.listTools()` | 列出所有已注册工具 |

## 4. 原生层详细职责

### 4.1 NativeBridge（`NovelNativeBridge.kt`）

| 方法 | 功能 | 对应 DAO |
|------|------|---------|
| `getNovelWorks()` | 获取作品列表 | `NovelDao.getAllWorks()` |
| `createWork()` | 创建新作品 | `NovelDao.insertWork()` |
| `getChapters()` | 获取章节列表 | `NovelDao.getChaptersByWorkId()` |
| `saveChapterContent()` | 保存章节内容 | `NovelDao.updateChapterContent()` |
| `getCharacters()` | 获取角色列表 | `NovelDao.getCharactersByWorkId()` |
| `getSettings()` | 获取设定列表 | `NovelDao.getSettingsByWorkId()` |
| `getTomatoPresets()` | 获取番茄预设 | `NovelDao.getAllTomatoPresets()` |

### 4.2 Service 层

| Service | 职责 |
|---------|------|
| `FloatingChatService` | 悬浮聊天窗口、AI 对话管理 |
| `ChatServiceCore` | 对话核心逻辑、API 调用 |
| `ChatServiceUiBridge` | Service ↔ UI 通信桥接 |
| `TermuxCommandResultService` | 终端命令执行结果回调 |
| `UIDebuggerService` | UI 调试辅助服务 |
| `CloudEmbeddingService` | 云端向量嵌入服务 |

### 4.3 ContentProvider 层

| Provider | 职责 |
|----------|------|
| `MemoryDocumentsProvider` | 记忆文档跨应用共享 |
| `WorkspaceDocumentsProvider` | 工作区文件跨应用共享 |

### 4.4 数据层（Room）

| DAO | 职责 |
|-----|------|
| `NovelDao` | 网文写作全部数据访问（19个实体） |
| `ChatDao` | 对话数据访问 |
| `MessageDao` | 消息数据访问 |

## 5. 调用链路示例

### 5.1 保存章节内容

```
HTML 前端
  → window.NativeBridge.saveChapterContent(chapterId, content, wordCount)
    → NovelNativeBridge.saveChapterContent()  [@JavascriptInterface]
      → NovelRepository.updateChapterContent()
        → NovelDao.updateChapterContent()
          → Room → SQLite
```

### 5.2 获取作品列表

```
HTML 前端
  → window.NativeBridge.getNovelWorks()
    → NovelNativeBridge.getNovelWorks()
      → NovelRepository.getAllWorks()  [Flow]
        → NovelDao.getAllWorks()
          → Room → SQLite → Flow<List<NovelWork>>
```

## 6. 安全边界

| 边界 | ToolPkg 层 | 原生层 |
|------|------------|--------|
| JS 注入防护 | 无（前端责任） | NativeBridge 方法需校验 caller origin |
| 权限控制 | 工具声明 requiredPermissions | Service 层校验 Android 权限 |
| 数据隔离 | 无直接数据访问 | Room 数据库、Provider 权限控制 |
| API Key 保护 | 不接触 API Key | ApiKeyInfo 实体、加密存储 |

## 7. 新增模块指引

### 7.1 新增 ToolPkg 工具

1. 在 `plugin/` 目录创建工具描述类
2. 在 `PluginRegistry` 注册
3. 如需与原生交互，通过 `NativeBridge` 接口

### 7.2 新增原生能力

1. 在 `NovelNativeBridge` 新增 `@JavascriptInterface` 方法
2. 实现对应的 Repository 方法
3. 实现对应的 DAO 方法（如需新表，先写 Migration）
4. 更新本文档职责对照表
