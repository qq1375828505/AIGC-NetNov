# NativeBridge API 接口文档

> **项目**: AIGC-NetNov (网文写作IDE)
> **版本**: 0.1.0
> **最后更新**: 2026-06-22
> **状态**: 开发中
> **方法总数**: 104个

---

## 目录

- [1. 概述](#1-概述)
- [2. 架构说明](#2-架构说明)
- [3. 接口分类总览](#3-接口分类总览)
- [4. 作品管理 (Works)](#4-作品管理-works)
- [5. 章节管理 (Chapters)](#5-章节管理-chapters)
- [6. 角色管理 (Characters)](#6-角色管理-characters)
- [7. 设定管理 (Settings)](#7-设定管理-settings)
- [8. 地点管理 (Locations)](#8-地点管理-locations)
- [9. 势力管理 (Factions)](#9-势力管理-factions)
- [10. 道具管理 (Items)](#10-道具管理-items)
- [11. 伏笔管理 (PlotHooks)](#11-伏笔管理-plothooks)
- [12. 参考资料 (References)](#12-参考资料-references)
- [13. 写作待办 (Todos)](#13-写作待办-todos)
- [14. 角色关系图 (Relationships)](#14-角色关系图-relationships)
- [15. 事件管理 (Events)](#15-事件管理-events)
- [16. 事件参与者 (EventParticipants)](#16-事件参与者-eventparticipants)
- [17. 番茄钟 (Tomato)](#17-番茄钟-tomato)
- [18. 写作统计 (Statistics)](#18-写作统计-statistics)
- [19. 卷管理 (Volumes)](#19-卷管理-volumes)
- [20. 自定义资料夹 (CustomFolders)](#20-自定义资料夹-customfolders)
- [21. 自定义资料条目 (CustomItems)](#21-自定义资料条目-customitems)
- [22. 写作技能 (WritingSkills)](#22-写作技能-writingskills)
- [23. 设定提醒 (SettingReminders)](#23-设定提醒-settingreminders)
- [24. 导入导出 (ImportExport)](#24-导入导出-importexport)
- [25. Agent管理 (Agents)](#25-agent管理-agents)
- [26. 技能管理 (Skills)](#26-技能管理-skills)
- [27. 大纲管理 (Outline)](#27-大纲管理-outline)
- [28. 资料详情方法 (DetailMethods)](#28-资料详情方法-detailmethods)
- [29. 统计扩展 (StatsExtended)](#29-统计扩展-statsextended)
- [30. 作品详情 (WorkDetail)](#30-作品详情-workdetail)
- [31. 导航 (Navigation)](#31-导航-navigation)
- [附录A: TypeScript接口定义](#附录a-typescript接口定义)
- [附录B: Kotlin后端实现](#附录b-kotlin后端实现)

---

## 1. 概述

NativeBridge 是 AIGC-NetNov 项目的核心桥接层，负责 TypeScript 前端与 Kotlin 后端之间的通信。

### 1.1 通信架构

```
┌─────────────────────────────────────────────────────────────┐
│                    TypeScript 前端层                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ UI 页面     │  │ Packages    │  │ Lib (Bridge封装)     │  │
│  │ (22个.ts)   │  │ (8个.ts)    │  │ native_bridge_init  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          ▼                                   │
│              window.NativeBridge.xxx()                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JavaScript Bridge
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Kotlin 后端层                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ NovelNativeBridge.kt (1653行, 104个方法)              │  │
│  │ @JavascriptInterface 注解暴露给 WebView               │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ NovelRepository (数据仓库层)                           │  │
│  │ ObjectBox 数据库                                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 调用方式

项目中存在两种调用方式：

| 方式 | 使用位置 | 示例 |
|------|----------|------|
| `window.NativeBridge.xxx()` | UI 页面、`native_bridge_init.ts` | `window.NativeBridge.getNovelWorks()` |
| `Tools.callNative("xxx")` | Packages 工具层 | `Tools.callNative("getNovelWorks", [])` |

### 1.3 返回格式

**统一返回格式 (JSON字符串)**:
```json
// 成功
{"success": true, "id": "xxx"}
// 或列表数据
[{...}, {...}]

// 失败
{"success": false, "error": "错误信息"}
```

---

## 2. 架构说明

### 2.1 文件结构

```
examples/novelide/
├── src/
│   ├── main.ts                    # 入口文件，注册路由和工具
│   ├── lib/
│   │   ├── native_bridge_init.ts  # NativeBridge接口声明 + NovelBridge封装
│   │   ├── db_bridge.ts           # NovelDBBridge封装
│   │   ├── ai_bridge.ts           # AI桥接层
│   │   ├── prompt_templates.ts    # AI提示词模板
│   │   ├── thought_renderer.ts    # 思考过程渲染器
│   │   ├── agent_manager.ts       # Agent管理器
│   │   ├── skill_manager.ts       # 技能管理器
│   │   └── ui_bridge.js           # UI桥接
│   ├── packages/                  # 工具包（注册66个Tools）
│   │   ├── novel_works.ts         # 5个工具：作品CRUD
│   │   ├── novel_chapters.ts      # 6个工具：章节管理
│   │   ├── novel_materials.ts     # 40个工具：资料管理
│   │   ├── novel_ai_tools.ts      # 7个工具：AI写作
│   │   ├── novel_io.ts            # 4个工具：导入导出
│   │   ├── novel_stats.ts         # 3个工具：写作统计
│   │   ├── novel_agents.ts        # 2个工具：Agent调度
│   │   └── novel_utils.ts         # 工具函数
│   └── ui/                        # UI页面（22个.ts）
│       ├── novel_works_page.ts
│       ├── novel_editor_page.ts
│       ├── novel_materials_page.ts
│       └── ...
├── resources/
│   └── webapp/                    # HTML资源（24个.html）
└── dist/                          # 编译输出
```

### 2.2 Kotlin后端

- **文件**: `app/src/main/java/com/ai/assistance/novelide/bridge/NovelNativeBridge.kt`
- **代码量**: 1653行
- **方法数**: 94个 `@JavascriptInterface` 方法
- **依赖**: `NovelRepository` (ObjectBox数据库)

---

## 3. 接口分类总览

| 分类 | 方法数 | 说明 |
|------|--------|------|
| 作品管理 | 4 | CRUD操作 |
| 章节管理 | 6 | 创建、获取、保存、删除、排序 |
| 角色管理 | 4 | CRUD + 列表 |
| 设定管理 | 4 | CRUD + 列表 |
| 地点管理 | 4 | CRUD + 列表 |
| 势力管理 | 4 | CRUD + 列表 |
| 道具管理 | 4 | CRUD + 列表 |
| 伏笔管理 | 4 | CRUD + 列表 |
| 参考资料 | 4 | CRUD + 列表 |
| 写作待办 | 4 | CRUD + 列表 |
| 角色关系 | 4 | CRUD操作 |
| 事件管理 | 4 | CRUD操作 |
| 事件参与者 | 3 | 添加/删除/获取 |
| 番茄钟 | 2 | 预设获取 |
| 写作统计 | 1 | 总体统计 |
| 卷管理 | 4 | CRUD操作 |
| 自定义资料夹 | 4 | CRUD操作 |
| 自定义资料条目 | 5 | CRUD + 按文件夹获取 |
| 写作技能 | 4 | CRUD操作 |
| 设定提醒 | 4 | CRUD操作 |
| 导入导出 | 4 | 文件导入 + 3种格式导出 |
| **Agent管理** | **4** | **会话管理 + 任务调度** |
| **技能管理** | **2** | **获取/应用技能** |
| 大纲管理 | **6** | **CRUD + 更新/重排** |
| 番茄扩展 | 1 | 记录完成 |
| 资料详情 | 7 | 7种资料类型的详情获取 |
| 统计扩展 | 2 | 章节/每日统计 |
| 作品详情 | 1 | 单作品详情 |
| 导航 | 1 | 章节导航 |
| **总计** | **104** | |

---

## 4. 作品管理 (Works)

### 4.1 getNovelWorks

获取所有小说作品列表。

```typescript
getNovelWorks(): string
```

**参数**: 无

**返回**: JSON数组字符串
```json
[
  {
    "id": "uuid",
    "title": "作品标题",
    "genre": "类型",
    "description": "简介",
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

**Kotlin实现**: `NovelNativeBridge.kt:37-47`
```kotlin
@JavascriptInterface
fun getNovelWorks(): String {
    return runBlocking(Dispatchers.IO) {
        try {
            val works = repository.getAllWorks().first()
            gson.toJson(works)
        } catch (e: Exception) {
            e.printStackTrace()
            "[]"
        }
    }
}
```

---

### 4.2 createWork

创建新的小说作品。

```typescript
createWork(title: string, genre: string, description: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 作品标题 |
| genre | string | 否 | 作品类型 |
| description | string | 否 | 作品简介 |

**返回**: `{"success": true, "id": "新作品ID"}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:49-67`

---

### 4.3 updateWork

更新作品信息。

```typescript
updateWork(workJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workJson | string | 是 | 作品JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:69-82`

---

### 4.4 deleteWork

删除指定作品。

```typescript
deleteWork(workId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:84-96`

---

## 5. 章节管理 (Chapters)

### 5.1 getChapters

获取指定作品的所有章节。

```typescript
getChapters(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串
```json
[
  {
    "id": "uuid",
    "workId": "作品ID",
    "title": "章节标题",
    "content": "章节内容",
    "wordCount": 1000,
    "sortOrder": 0,
    "status": "draft",
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

**Kotlin实现**: `NovelNativeBridge.kt:100-111`

---

### 5.2 createChapter

为指定作品创建新章节。

```typescript
createChapter(workId: string, title: string, order: number): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| title | string | 是 | 章节标题 |
| order | number | 否 | 排序顺序 |

**返回**: `{"success": true, "id": "新章节ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:113-131`

---

### 5.3 getChapterContent

获取指定章节的内容。

```typescript
getChapterContent(chapterId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| chapterId | string | 是 | 章节ID |

**返回**: 章节内容字符串（纯文本）

**Kotlin实现**: `NovelNativeBridge.kt:133-144`

---

### 5.4 saveChapterContent

保存章节内容。

```typescript
saveChapterContent(chapterId: string, content: string, wordCount: number): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| chapterId | string | 是 | 章节ID |
| content | string | 是 | 章节内容 |
| wordCount | number | 否 | 字数 |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:146-158`

---

### 5.5 deleteChapter

删除指定章节。

```typescript
deleteChapter(chapterId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| chapterId | string | 是 | 章节ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:160-172`

---

### 5.6 reorderChapters

重新排序章节。

```typescript
reorderChapters(workId: string, chapterIdsJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| chapterIdsJson | string | 是 | 章节ID数组JSON字符串（按新顺序） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:174-192`

---

## 6. 角色管理 (Characters)

### 6.1 getCharacters

获取指定作品的所有角色列表。

```typescript
getCharacters(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串
```json
[
  {
    "id": "uuid",
    "workId": "作品ID",
    "name": "角色姓名",
    "role": "角色描述",
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

**Kotlin实现**: `NovelNativeBridge.kt:196-207`

---

### 6.2 createCharacter

创建角色。

```typescript
createCharacter(workId: string, name: string, role: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| name | string | 是 | 角色姓名 |
| role | string | 否 | 角色描述/定位 |

**返回**: `{"success": true, "id": "新角色ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:209-227`

---

### 6.3 updateCharacter

更新角色信息。

```typescript
updateCharacter(characterJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| characterJson | string | 是 | 角色JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:229-242`

---

### 6.4 deleteCharacter

删除指定角色。

```typescript
deleteCharacter(characterId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| characterId | string | 是 | 角色ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:244-256`

---

## 7. 设定管理 (Settings)

### 7.1 getSettings

获取指定作品的所有设定列表。

```typescript
getSettings(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:260-271`

---

### 7.2 createSetting

创建世界观设定。

```typescript
createSetting(workId: string, name: string, content: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| name | string | 是 | 设定名称 |
| content | string | 是 | 设定内容 |

**返回**: `{"success": true, "id": "新设定ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:273-291`

---

### 7.3 updateSetting

更新世界观设定。

```typescript
updateSetting(settingJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| settingJson | string | 是 | 设定JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:293-306`

---

### 7.4 deleteSetting

删除指定设定。

```typescript
deleteSetting(settingId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| settingId | string | 是 | 设定ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:308-320`

---

## 8. 地点管理 (Locations)

### 8.1 getLocations

获取指定作品的所有地点列表。

```typescript
getLocations(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:324-335`

---

### 8.2 createLocation

创建地点。

```typescript
createLocation(workId: string, name: string, description: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| name | string | 是 | 地点名称 |
| description | string | 否 | 地点描述 |

**返回**: `{"success": true, "id": "新地点ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:337-355`

---

### 8.3 updateLocation

更新地点信息。

```typescript
updateLocation(locationJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| locationJson | string | 是 | 地点JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:357-370`

---

### 8.4 deleteLocation

删除指定地点。

```typescript
deleteLocation(locationId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| locationId | string | 是 | 地点ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:372-384`

---

## 9. 势力管理 (Factions)

### 9.1 getFactions

获取指定作品的所有势力列表。

```typescript
getFactions(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:388-399`

---

### 9.2 createFaction

创建势力。

```typescript
createFaction(workId: string, name: string, leader: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| name | string | 是 | 势力名称 |
| leader | string | 否 | 领导者 |

**返回**: `{"success": true, "id": "新势力ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:401-419`

---

### 9.3 updateFaction

更新势力信息。

```typescript
updateFaction(factionJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| factionJson | string | 是 | 势力JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:421-434`

---

### 9.4 deleteFaction

删除指定势力。

```typescript
deleteFaction(factionId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| factionId | string | 是 | 势力ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:436-448`

---

## 10. 道具管理 (Items)

### 10.1 getItems

获取指定作品的所有道具列表。

```typescript
getItems(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:452-463`

---

### 10.2 createItem

创建道具。

```typescript
createItem(workId: string, name: string, description: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| name | string | 是 | 道具名称 |
| description | string | 否 | 道具描述 |

**返回**: `{"success": true, "id": "新道具ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:465-483`

---

### 10.3 updateItem

更新道具信息。

```typescript
updateItem(itemJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| itemJson | string | 是 | 道具JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:485-498`

---

### 10.4 deleteItem

删除指定道具。

```typescript
deleteItem(itemId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| itemId | string | 是 | 道具ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:500-512`

---

## 11. 伏笔管理 (PlotHooks)

### 11.1 getPlotHooks

获取指定作品的所有伏笔列表。

```typescript
getPlotHooks(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:516-527`

---

### 11.2 createPlotHook

创建伏笔。

```typescript
createPlotHook(workId: string, content: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| content | string | 是 | 伏笔内容 |

**返回**: `{"success": true, "id": "新伏笔ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:529-546`

---

### 11.3 updatePlotHook

更新伏笔信息。

```typescript
updatePlotHook(hookJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| hookJson | string | 是 | 伏笔JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:548-561`

---

### 11.4 deletePlotHook

删除指定伏笔。

```typescript
deletePlotHook(hookId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| hookId | string | 是 | 伏笔ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:563-575`

---

## 12. 参考资料 (References)

### 12.1 getReferences

获取指定作品的所有参考资料列表。

```typescript
getReferences(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:579-590`

---

### 12.2 createReference

创建参考资料。

```typescript
createReference(workId: string, title: string, content: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| title | string | 是 | 资料标题 |
| content | string | 是 | 资料内容 |

**返回**: `{"success": true, "id": "新资料ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:592-610`

---

### 12.3 updateReference

更新参考资料。

```typescript
updateReference(referenceJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| referenceJson | string | 是 | 资料JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:612-625`

---

### 12.4 deleteReference

删除指定参考资料。

```typescript
deleteReference(referenceId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| referenceId | string | 是 | 资料ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:627-639`

---

## 13. 写作待办 (Todos)

### 13.1 getTodos

获取指定作品的所有写作待办列表。

```typescript
getTodos(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:643-654`

---

### 13.2 createTodo

创建写作待办。

```typescript
createTodo(workId: string, content: string, priority: number): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| content | string | 是 | 待办内容 |
| priority | number | 否 | 优先级 (0=低, 1=中, 2=高) |

**返回**: `{"success": true, "id": "新待办ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:656-674`

---

### 13.3 updateTodo

更新写作待办。

```typescript
updateTodo(todoJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| todoJson | string | 是 | 待办JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:676-689`

---

### 13.4 deleteTodo

删除指定写作待办。

```typescript
deleteTodo(todoId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| todoId | string | 是 | 待办ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:691-703`

---

## 14. 角色关系图 (Relationships)

### 14.1 getCharacterRelationships

获取指定作品的所有角色关系。

```typescript
getCharacterRelationships(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:707-718`

---

### 14.2 createCharacterRelationship

创建角色关系。

```typescript
createCharacterRelationship(workId: string, sourceId: string, targetId: string, relationType: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| sourceId | string | 是 | 源角色ID |
| targetId | string | 是 | 目标角色ID |
| relationType | string | 是 | 关系类型 |

**返回**: `{"success": true, "id": "新关系ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:720-739`

---

### 14.3 updateCharacterRelationship

更新角色关系。

```typescript
updateCharacterRelationship(relationshipJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| relationshipJson | string | 是 | 关系JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:741-754`

---

### 14.4 deleteCharacterRelationship

删除指定角色关系。

```typescript
deleteCharacterRelationship(relationshipId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| relationshipId | string | 是 | 关系ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:756-768`

---

## 15. 事件管理 (Events)

### 15.1 getNovelEvents

获取指定作品的所有事件。

```typescript
getNovelEvents(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:772-783`

---

### 15.2 createNovelEvent

创建事件。

```typescript
createNovelEvent(workId: string, title: string, description: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| title | string | 是 | 事件标题 |
| description | string | 否 | 事件描述 |

**返回**: `{"success": true, "id": "新事件ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:785-803`

---

### 15.3 updateNovelEvent

更新事件信息。

```typescript
updateNovelEvent(eventJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| eventJson | string | 是 | 事件JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:805-818`

---

### 15.4 deleteNovelEvent

删除指定事件。

```typescript
deleteNovelEvent(eventId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| eventId | string | 是 | 事件ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:820-832`

---

## 16. 番茄钟 (Tomato)

### 16.1 getTomatoPresets

获取所有番茄钟预设。

```typescript
getTomatoPresets(): string
```

**参数**: 无

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:885-896`

---

### 16.2 getTomatoPresetById

获取指定番茄钟预设。

```typescript
getTomatoPresetById(presetId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| presetId | string | 是 | 预设ID |

**返回**: JSON对象字符串

**Kotlin实现**: `NovelNativeBridge.kt:898-909`

---

### 16.3 recordTomatoComplete

记录番茄钟完成。

```typescript
recordTomatoComplete(workId: string, presetName: string, durationMinutes: number): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| presetName | string | 是 | 预设名称 |
| durationMinutes | number | 是 | 持续时间（分钟） |

**返回**: `{"success": true, "message": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1626-1637`

---

## 17. 写作统计 (Statistics)

### 17.1 getWritingStats

获取写作统计信息。

```typescript
getWritingStats(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON对象字符串
```json
{
  "totalWords": 10000,
  "totalChapters": 10,
  "workId": "作品ID",
  "avgChapterWords": 1000,
  "recentWords7d": 5000,
  "dailyStats": {"2026-6-22": 1000},
  "statusCounts": {"draft": 5, "completed": 5},
  "longestChapter": {"id": "...", "title": "...", "wordCount": 2000},
  "shortestChapter": {"id": "...", "title": "...", "wordCount": 500}
}
```

**Kotlin实现**: `NovelNativeBridge.kt:913-961`

---

## 18. 卷管理 (Volumes)

### 18.1 getVolumes

获取指定作品的所有卷。

```typescript
getVolumes(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:965-976`

---

### 18.2 createVolume

创建卷。

```typescript
createVolume(workId: string, title: string, sortOrder: number): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| title | string | 是 | 卷标题 |
| sortOrder | number | 否 | 排序顺序 |

**返回**: `{"success": true, "id": "新卷ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:978-996`

---

### 18.3 updateVolume

更新卷信息。

```typescript
updateVolume(volumeJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| volumeJson | string | 是 | 卷JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:998-1011`

---

### 18.4 deleteVolume

删除指定卷。

```typescript
deleteVolume(volumeId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| volumeId | string | 是 | 卷ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1013-1028`

---

## 19. 自定义资料夹 (CustomFolders)

### 19.1 getCustomFolders

获取指定作品的所有自定义资料夹。

```typescript
getCustomFolders(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:1032-1043`

---

### 19.2 createCustomFolder

创建自定义资料夹。

```typescript
createCustomFolder(workId: string, name: string, icon: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| name | string | 是 | 资料夹名称 |
| icon | string | 否 | 图标 |

**返回**: `{"success": true, "id": "新资料夹ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:1045-1063`

---

### 19.3 updateCustomFolder

更新自定义资料夹。

```typescript
updateCustomFolder(folderJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| folderJson | string | 是 | 资料夹JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1065-1078`

---

### 19.4 deleteCustomFolder

删除指定自定义资料夹。

```typescript
deleteCustomFolder(folderId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| folderId | string | 是 | 资料夹ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1080-1092`

---

## 20. 自定义资料条目 (CustomItems)

### 20.1 getCustomItems

获取指定作品的所有自定义资料条目。

```typescript
getCustomItems(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:1096-1111`

---

### 20.2 getItemsByFolder

获取指定资料夹的所有条目。

```typescript
getItemsByFolder(folderId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| folderId | string | 是 | 资料夹ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:1113-1124`

---

### 20.3 createCustomItem

创建自定义资料条目。

```typescript
createCustomItem(workId: string, folderId: string, title: string, content: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| folderId | string | 是 | 资料夹ID |
| title | string | 是 | 条目标题 |
| content | string | 否 | 条目内容 |

**返回**: `{"success": true, "id": "新条目ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:1126-1144`

---

### 20.4 updateCustomItem

更新自定义资料条目。

```typescript
updateCustomItem(itemJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| itemJson | string | 是 | 条目JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1146-1159`

---

### 20.5 deleteCustomItem

删除指定自定义资料条目。

```typescript
deleteCustomItem(itemId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| itemId | string | 是 | 条目ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1161-1173`

---

## 21. 写作技能 (WritingSkills)

### 21.1 getWritingSkills

获取所有写作技能。

```typescript
getWritingSkills(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:1177-1188`

---

### 21.2 createWritingSkill

创建写作技能。

```typescript
createWritingSkill(workId: string, name: string, description: string, promptTemplate: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| name | string | 是 | 技能名称 |
| description | string | 否 | 技能描述 |
| promptTemplate | string | 否 | 提示词模板 |

**返回**: `{"success": true, "id": "新技能ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:1190-1208`

---

### 21.3 updateWritingSkill

更新写作技能。

```typescript
updateWritingSkill(skillJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skillJson | string | 是 | 技能JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1210-1223`

---

### 21.4 deleteWritingSkill

删除指定写作技能。

```typescript
deleteWritingSkill(skillId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skillId | string | 是 | 技能ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1225-1240`

---

## 22. 设定提醒 (SettingReminders)

### 22.1 getSettingReminders

获取指定作品的所有设定提醒。

```typescript
getSettingReminders(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:1244-1255`

---

### 22.2 createSettingReminder

创建设定提醒。

```typescript
createSettingReminder(workId: string, settingId: string, content: string, triggerType: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| settingId | string | 是 | 设定ID |
| content | string | 是 | 提醒内容 |
| triggerType | string | 否 | 触发类型 |

**返回**: `{"success": true, "id": "新提醒ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:1257-1275`

---

### 22.3 updateSettingReminder

更新设定提醒。

```typescript
updateSettingReminder(reminderJson: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reminderJson | string | 是 | 提醒JSON对象（必须包含id字段） |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1277-1290`

---

### 22.4 deleteSettingReminder

删除指定设定提醒。

```typescript
deleteSettingReminder(reminderId: string): boolean
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reminderId | string | 是 | 提醒ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1292-1307`

---

## 23. 导入导出 (ImportExport)

### 23.1 importFile

导入文件（支持 TXT/Markdown/JSON 格式）。

```typescript
importFile(uri: string, fileName: string, workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uri | string | 是 | 文件URI |
| fileName | string | 是 | 文件名（用于判断格式） |
| workId | string | 否 | 目标作品ID |

**返回**: `{"success": true, "workId": "..."}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1311-1362`

---

### 23.2 exportWorkTxt

将作品导出为 TXT 格式。

```typescript
exportWorkTxt(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: `{"success": true, "content": "..."}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1364-1367`

---

### 23.3 exportWorkMd

将作品导出为 Markdown 格式。

```typescript
exportWorkMd(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: `{"success": true, "content": "..."}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1369-1372`

---

### 23.4 exportWorkJson

将作品导出为 JSON 格式。

```typescript
exportWorkJson(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: `{"success": true, "content": "..."}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1374-1377`

---

## 25. Agent管理 (Agents)

### 25.1 getAvailableAgents

获取所有可用的 Agent 列表。

```typescript
getAvailableAgents(): string
```

**参数**: 无

**返回**: JSON数组字符串
```json
[
  {
    "id": "continue_writing",
    "name": "续写助手",
    "description": "根据前文内容自动续写后续情节"
  },
  {
    "id": "polish",
    "name": "文本精修器",
    "description": "8维度精修文本"
  }
]
```

**Kotlin实现**: `NovelNativeBridge.kt:1645-1665`

---

### 25.2 createAgentSession

创建 Agent 会话。

```typescript
createAgentSession(agentId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| agentId | string | 是 | Agent ID |

**返回**: `{"success": true, "sessionId": "...", "agentId": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1667-1680`

---

### 25.3 sendAgentTask

发送任务给 Agent。

```typescript
sendAgentTask(agentId: string, task: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| agentId | string | 是 | Agent ID |
| task | string | 是 | 任务描述 |

**返回**: `{"success": true, "agentId": "...", "status": "received", "message": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1681-1700`

---

### 25.4 getAgentResult

获取 Agent 执行结果。

```typescript
getAgentResult(agentId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| agentId | string | 是 | Agent ID |

**返回**: `{"success": true, "agentId": "...", "status": "idle", "result": ""}`

**Kotlin实现**: `NovelNativeBridge.kt:1701-1720`

---

## 26. 技能管理 (Skills)

### 26.1 getAvailableSkills

获取所有可用的写作技能。

```typescript
getAvailableSkills(): string
```

**参数**: 无

**返回**: JSON数组字符串
```json
[
  {
    "id": "skill_id",
    "name": "技能名称",
    "category": "分类",
    "description": "技能描述",
    "icon": "图标",
    "systemPrompt": "系统提示词",
    "tags": ["标签1", "标签2"]
  }
]
```

**Kotlin实现**: `NovelNativeBridge.kt:1722-1745`

---

### 26.2 applySkill

应用写作技能。

```typescript
applySkill(skillId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skillId | string | 是 | 技能ID |

**返回**: `{"success": true, "skillId": "...", "name": "...", "systemPrompt": "...", "category": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1747-1770`

---

## 27. 大纲管理 (Outline)

### 27.1 getOutlineNodes

获取指定作品的所有大纲节点。

```typescript
getOutlineNodes(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON数组字符串

**Kotlin实现**: `NovelNativeBridge.kt:1773-1786`

---

### 27.2 createOutlineNode

创建大纲节点。

```typescript
createOutlineNode(workId: string, title: string, content: string, parentId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| title | string | 是 | 节点标题 |
| content | string | 否 | 节点内容 |
| parentId | string | 否 | 父节点ID |

**返回**: `{"success": true, "id": "新节点ID"}`

**Kotlin实现**: `NovelNativeBridge.kt:1787-1805`

---

### 27.3 updateOutlineNode

更新大纲节点。

```typescript
updateOutlineNode(nodeId: string, title: string, content: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nodeId | string | 是 | 节点ID |
| title | string | 是 | 节点标题 |
| content | string | 否 | 节点内容 |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1807-1809`（调用 updateOutlineNodeEx）

---

### 27.4 updateOutlineNodeEx

更新大纲节点（扩展版本，支持关联章节）。

```typescript
updateOutlineNodeEx(nodeId: string, title: string, content: string, chapterId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nodeId | string | 是 | 节点ID |
| title | string | 是 | 节点标题 |
| content | string | 否 | 节点内容 |
| chapterId | string | 否 | 关联章节ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1812-1835`

---

### 27.5 reorderOutlineNode

重排大纲节点。

```typescript
reorderOutlineNode(nodeId: string, newParentId: string, newSortOrder: number): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nodeId | string | 是 | 节点ID |
| newParentId | string | 否 | 新父节点ID |
| newSortOrder | number | 是 | 新排序顺序 |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1837-1860`

---

### 27.6 deleteOutlineNode

删除大纲节点。

```typescript
deleteOutlineNode(nodeId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nodeId | string | 是 | 节点ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1874-1887`

---

### 27.7 updateOutlineNodeEx

更新大纲节点（扩展版本，支持关联章节）。

```typescript
updateOutlineNodeEx(nodeId: string, title: string, content: string, chapterId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nodeId | string | 是 | 节点ID |
| title | string | 是 | 节点标题 |
| content | string | 否 | 节点内容 |
| chapterId | string | 否 | 关联章节ID |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1577-1600`

---

### 24.2 reorderOutlineNode

重排大纲节点。

```typescript
reorderOutlineNode(nodeId: string, newParentId: string, newSortOrder: number): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nodeId | string | 是 | 节点ID |
| newParentId | string | 否 | 新父节点ID |
| newSortOrder | number | 是 | 新排序顺序 |

**返回**: `{"success": true}` 或 `{"success": false, "error": "..."}`

**Kotlin实现**: `NovelNativeBridge.kt:1602-1624`

---

## 28. 资料详情方法 (DetailMethods)

以下方法用于获取单个资料条目的详细信息。

### 28.1 getCharacterDetail

获取角色详情。

```typescript
getCharacterDetail(characterId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| characterId | string | 是 | 角色ID |

**返回**: JSON对象字符串

**注意**: 此方法在 TypeScript 接口中声明，但 Kotlin 后端可能未实现。

---

### 28.2 getSettingDetail

获取设定详情。

```typescript
getSettingDetail(settingId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| settingId | string | 是 | 设定ID |

**返回**: JSON对象字符串

---

### 28.3 getLocationDetail

获取地点详情。

```typescript
getLocationDetail(locationId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| locationId | string | 是 | 地点ID |

**返回**: JSON对象字符串

---

### 28.4 getFactionDetail

获取势力详情。

```typescript
getFactionDetail(factionId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| factionId | string | 是 | 势力ID |

**返回**: JSON对象字符串

---

### 28.5 getItemDetail

获取道具详情。

```typescript
getItemDetail(itemId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| itemId | string | 是 | 道具ID |

**返回**: JSON对象字符串

---

### 28.6 getHookDetail

获取伏笔详情。

```typescript
getHookDetail(hookId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| hookId | string | 是 | 伏笔ID |

**返回**: JSON对象字符串

---

### 28.7 getReferenceDetail

获取参考资料详情。

```typescript
getReferenceDetail(referenceId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| referenceId | string | 是 | 资料ID |

**返回**: JSON对象字符串

---

## 29. 统计扩展 (StatsExtended)

### 29.1 getChapterStats

获取章节统计。

```typescript
getChapterStats(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON对象字符串

**注意**: 此方法在 TypeScript 接口中声明，但 Kotlin 后端可能未实现。

---

### 29.2 getDailyStats

获取每日统计。

```typescript
getDailyStats(workId: string, days: number): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |
| days | number | 否 | 查询天数（默认30天） |

**返回**: JSON对象字符串

**注意**: 此方法在 TypeScript 接口中声明，但 Kotlin 后端可能未实现。

---

## 30. 作品详情 (WorkDetail)

### 30.1 getWork

获取单个作品详情。

```typescript
getWork(workId: string): string
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| workId | string | 是 | 作品ID |

**返回**: JSON对象字符串

---

## 31. 导航 (Navigation)

### 31.1 navigateToChapter

导航到指定章节。

```typescript
navigateToChapter(chapterId: string): void
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| chapterId | string | 是 | 章节ID |

**返回**: 无

---

## 附录A: TypeScript接口定义

完整的 `Window.NativeBridge` 接口声明位于:
`examples/novelide/src/lib/native_bridge_init.ts:4-148`

```typescript
declare global {
  interface Window {
    NativeBridge: {
      // 作品
      getNovelWorks(): string;
      createWork(title: string, genre: string, description: string): string;
      updateWork(workJson: string): boolean;
      deleteWork(workId: string): boolean;

      // 章节
      getChapters(workId: string): string;
      createChapter(workId: string, title: string, order: number): string;
      getChapterContent(chapterId: string): string;
      saveChapterContent(chapterId: string, content: string, wordCount: number): boolean;
      deleteChapter(chapterId: string): boolean;
      reorderChapters(workId: string, chapterIdsJson: string): boolean;

      // ... 其他方法
    };
  }
}
```

---

## 附录B: Kotlin后端实现

完整的 Kotlin 实现位于:
`app/src/main/java/com/ai/assistance/novelide/bridge/NovelNativeBridge.kt`

**类结构**:
```kotlin
class NovelNativeBridge(
    private val context: Context,
    private val repository: NovelRepository,
    private val scope: CoroutineScope
) {
    private val gson = Gson()

    @JavascriptInterface
    fun methodName(...): String {
        return runBlocking(Dispatchers.IO) {
            try {
                // 业务逻辑
                gson.toJson(result)
            } catch (e: Exception) {
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
    }
}
```

---

**文档维护者**: technical-writer
**最后更新**: 2026-06-22 21:55
