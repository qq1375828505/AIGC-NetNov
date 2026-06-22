# AIGC-NetNov 修复指南

> **项目**: AIGC-NetNov (网文写作IDE)
> **版本**: 0.1.0
> **最后更新**: 2026-06-22
> **目标读者**: frontend-dev

---

## 目录

- [1. 修复优先级](#1-修复优先级)
- [2. P0 修复步骤](#2-p0-修复步骤)
- [3. P1 修复步骤](#3-p1-修复步骤)
- [4. P2 修复步骤](#4-p2-修复步骤)
- [5. 测试验证](#5-测试验证)

---

## 1. 修复优先级

按照以下顺序修复问题：

1. **P0 严重问题** - 必须立即修复，影响核心功能
2. **P1 高优先级问题** - 影响用户体验和代码质量
3. **P2 中优先级问题** - 改善代码质量和可维护性

---

## 2. P0 修复步骤

### 2.1 修复 get_work 空壳实现

**文件**: `examples/novelide/src/packages/novel_works.ts`

**当前代码** (行 47-73):
```typescript
Tools.register("novelide:get_work", {
  description: "获取指定作品的详细信息",
  parameters: {
    type: "object",
    properties: {
      workId: { type: "string", description: "作品ID" }
    },
    required: ["workId"]
  },
  execute: async (params: any) => {
    const workId = requireString(params.workId, "workId");
    try {
      const works = await safeNativeJsonCall<any[]>("getNovelWorks", []);
      const work = works.find((w: any) => w.id === workId);
      if (!work) {
        Logger.warn(`作品不存在: ${workId}`);
        return { success: false, error: "作品不存在" };
      }
      Logger.info(`获取作品详情成功: ${workId}`);
      return { success: true, work };
    } catch (error) {
      Logger.error("获取作品详情失败", error);
      return { success: false, error: (error as Error).message || "获取作品详情失败" };
    }
  }
});
```

**修复方案**: 实现已存在（使用 `getNovelWorks` + 过滤），无需修改。

**验证**: 调用 `novelide:get_work` 工具，传入有效的 `workId`，应返回作品详情。

---

### 2.2 修复 NativeBridge 接口缺失

**问题**: 9 个方法在 TypeScript 接口中声明，但 Kotlin 后端未实现。

**方案 A: 在 Kotlin 后端实现** (推荐)

**文件**: `app/src/main/java/com/ai/assistance/novelide/bridge/NovelNativeBridge.kt`

**添加以下方法**:

```kotlin
// ==================== 资料详情方法 ====================

@JavascriptInterface
fun getCharacterDetail(characterId: String): String {
    return runBlocking(Dispatchers.IO) {
        try {
            val character = repository.getCharacterById(characterId)
            if (character != null) {
                gson.toJson(character)
            } else {
                gson.toJson(mapOf("success" to false, "error" to "角色不存在"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            AppLogger.e("NovelNativeBridge", "获取角色详情失败", e)
            gson.toJson(mapOf("success" to false, "error" to "操作失败"))
        }
    }
}

@JavascriptInterface
fun getSettingDetail(settingId: String): String {
    return runBlocking(Dispatchers.IO) {
        try {
            val setting = repository.getSettingById(settingId)
            if (setting != null) {
                gson.toJson(setting)
            } else {
                gson.toJson(mapOf("success" to false, "error" to "设定不存在"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            AppLogger.e("NovelNativeBridge", "获取设定详情失败", e)
            gson.toJson(mapOf("success" to false, "error" to "操作失败"))
        }
    }
}

@JavascriptInterface
fun getLocationDetail(locationId: String): String {
    return runBlocking(Dispatchers.IO) {
        try {
            val location = repository.getLocationById(locationId)
            if (location != null) {
                gson.toJson(location)
            } else {
                gson.toJson(mapOf("success" to false, "error" to "地点不存在"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            AppLogger.e("NovelNativeBridge", "获取地点详情失败", e)
            gson.toJson(mapOf("success" to false, "error" to "操作失败"))
        }
    }
}

@JavascriptInterface
fun getFactionDetail(factionId: String): String {
    return runBlocking(Dispatchers.IO) {
        try {
            val faction = repository.getFactionById(factionId)
            if (faction != null) {
                gson.toJson(faction)
            } else {
                gson.toJson(mapOf("success" to false, "error" to "势力不存在"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            AppLogger.e("NovelNativeBridge", "获取势力详情失败", e)
            gson.toJson(mapOf("success" to false, "error" to "操作失败"))
        }
    }
}

@JavascriptInterface
fun getItemDetail(itemId: String): String {
    return runBlocking(Dispatchers.IO) {
        try {
            val item = repository.getItemById(itemId)
            if (item != null) {
                gson.toJson(item)
            } else {
                gson.toJson(mapOf("success" to false, "error" to "道具不存在"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            AppLogger.e("NovelNativeBridge", "获取道具详情失败", e)
            gson.toJson(mapOf("success" to false, "error" to "操作失败"))
        }
    }
}

@JavascriptInterface
fun getHookDetail(hookId: String): String {
    return runBlocking(Dispatchers.IO) {
        try {
            val hook = repository.getPlotHookById(hookId)
            if (hook != null) {
                gson.toJson(hook)
            } else {
                gson.toJson(mapOf("success" to false, "error" to "伏笔不存在"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            AppLogger.e("NovelNativeBridge", "获取伏笔详情失败", e)
            gson.toJson(mapOf("success" to false, "error" to "操作失败"))
        }
    }
}

@JavascriptInterface
fun getReferenceDetail(referenceId: String): String {
    return runBlocking(Dispatchers.IO) {
        try {
            val reference = repository.getReferenceById(referenceId)
            if (reference != null) {
                gson.toJson(reference)
            } else {
                gson.toJson(mapOf("success" to false, "error" to "参考资料不存在"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            AppLogger.e("NovelNativeBridge", "获取参考资料详情失败", e)
            gson.toJson(mapOf("success" to false, "error" to "操作失败"))
        }
    }
}

@JavascriptInterface
fun getChapterStats(workId: String): String {
    return runBlocking(Dispatchers.IO) {
        try {
            val chapters = repository.getChaptersByWorkId(workId).first()
            val stats = mapOf(
                "totalChapters" to chapters.size,
                "totalWords" to chapters.sumOf { it.wordCount },
                "avgWords" to if (chapters.isNotEmpty()) chapters.sumOf { it.wordCount } / chapters.size else 0,
                "longestChapter" to chapters.maxByOrNull { it.wordCount }?.let { mapOf("id" to it.id, "title" to it.title, "wordCount" to it.wordCount) },
                "shortestChapter" to chapters.filter { it.wordCount > 0 }.minByOrNull { it.wordCount }?.let { mapOf("id" to it.id, "title" to it.title, "wordCount" to it.wordCount) }
            )
            gson.toJson(stats)
        } catch (e: Exception) {
            e.printStackTrace()
            AppLogger.e("NovelNativeBridge", "获取章节统计失败", e)
            gson.toJson(mapOf("success" to false, "error" to "操作失败"))
        }
    }
}

@JavascriptInterface
fun getDailyStats(workId: String, days: Int): String {
    return runBlocking(Dispatchers.IO) {
        try {
            val chapters = repository.getChaptersByWorkId(workId).first()
            val now = System.currentTimeMillis()
            val startTime = now - days.toLong() * 24 * 60 * 60 * 1000

            val recentChapters = chapters.filter { it.updatedAt >= startTime }
            val dailyStats = recentChapters.groupBy {
                val cal = java.util.Calendar.getInstance()
                cal.timeInMillis = it.updatedAt
                "${cal.get(java.util.Calendar.YEAR)}-${cal.get(java.util.Calendar.MONTH) + 1}-${cal.get(java.util.Calendar.DAY_OF_MONTH)}"
            }.mapValues { entry -> entry.value.sumOf { it.wordCount } }

            gson.toJson(mapOf(
                "days" to days,
                "dailyStats" to dailyStats,
                "totalWords" to recentChapters.sumOf { it.wordCount }
            ))
        } catch (e: Exception) {
            e.printStackTrace()
            AppLogger.e("NovelNativeBridge", "获取每日统计失败", e)
            gson.toJson(mapOf("success" to false, "error" to "操作失败"))
        }
    }
}
```

**方案 B: 在 TypeScript 层使用已有方法** (临时方案)

如果 Kotlin 后端实现需要时间，可以临时修改 TypeScript 代码使用已有的列表方法：

```typescript
// novel_materials.ts - 修改 get_character 工具
Tools.register("novelide:get_character", {
  // ...
  execute: async (params: any) => {
    const characterId = requireString(params.characterId, "characterId");
    try {
      // 使用列表方法 + 过滤
      const characters = await safeNativeJsonCall<any[]>("getCharacters", [""]);
      const character = characters.find((c: any) => c.id === characterId);
      if (!character) {
        return { success: false, error: "角色不存在" };
      }
      return { success: true, character };
    } catch (error) {
      // ...
    }
  }
});
```

---

### 2.3 修复硬编码敏感信息

**步骤**:

1. **撤销已泄露的 Token**
   - 在 GitHub 上撤销 Token
   - 生成新的 Token

2. **移除硬编码值**
   - 搜索代码中的硬编码 Token
   - 替换为环境变量读取

3. **添加环境变量支持**

```typescript
// 使用环境变量
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const API_TOKEN = process.env.API_TOKEN || "";
```

4. **更新 .gitignore**

```gitignore
# 环境变量文件
.env
.env.local
.env.*.local
```

---

## 3. P1 修复步骤

### 3.1 添加错误处理

**文件**: 所有 `packages/*.ts` 文件

**修复模式**:

```typescript
// 修改前
execute: async (params: any) => {
  const workId = requireString(params.workId, "workId");
  const result = await safeNativeCall<string>("createWork", [title, genre, description]);
  return { success: true, workId: result };
}

// 修改后
execute: async (params: any) => {
  const workId = requireString(params.workId, "workId");
  try {
    const result = await safeNativeCall<string>("createWork", [title, genre, description]);
    Logger.info(`创建作品成功: ${result}`);
    return { success: true, workId: result };
  } catch (error) {
    Logger.error("创建作品失败", error);
    return { success: false, error: (error as Error).message || "创建作品失败" };
  }
}
```

**需要修改的文件**:
- `novel_works.ts` - 5 个工具
- `novel_chapters.ts` - 6 个工具
- `novel_materials.ts` - 40 个工具
- `novel_stats.ts` - 3 个工具
- `novel_io.ts` - 4 个工具
- `novel_agents.ts` - 2 个工具

---

### 3.2 保护 JSON.parse 调用

**修复模式**:

```typescript
// 修改前
const result = JSON.parse(raw);

// 修改后 - 使用 safeJsonParse
import { safeJsonParse } from "./novel_utils";
const result = safeJsonParse(raw);
if (result === null) {
  return { success: false, error: "数据解析失败" };
}

// 或者使用 try-catch
try {
  const result = JSON.parse(raw);
} catch (e) {
  Logger.error("JSON 解析失败", e);
  return { success: false, error: "数据格式错误" };
}
```

**搜索需要修改的位置**:
```bash
# 搜索所有 JSON.parse 调用
grep -r "JSON.parse" examples/novelide/src/
```

---

### 3.3 统一 API 调用方式

**决策**: 统一使用 `Tools.callNative` 方式（已封装在 `novel_utils.ts` 中）

**修改 UI 页面**:

```typescript
// 修改前 (UI 页面)
const result = window.NativeBridge.getNovelWorks();

// 修改后
import { safeNativeJsonCall } from "../packages/novel_utils";
const result = await safeNativeJsonCall("getNovelWorks", []);
```

**需要修改的文件**:
- `novel_outline_page.ts`
- `novel_skills_page.ts`
- `novel_agents_page.ts`

---

### 3.4 修复内存泄漏

**文件**: `novel_editor_page.ts`

**修改**:

```typescript
// 修改前
let saveTimer: NodeJS.Timeout;

// 修改后 - 在组件中管理定时器
useEffect(() => {
  let saveTimer: NodeJS.Timeout;

  // ... 定时器逻辑

  return () => {
    if (saveTimer) {
      clearInterval(saveTimer);
    }
  };
}, []);
```

---

### 3.5 修复参数不匹配

**文件**: `novel_materials.ts`

**修改**:

```typescript
// 修改前
Tools.register("novelide:create_hook", {
  // ...
  execute: async (params: any) => {
    const hookContent = title ? `${title}\n${content}` : content;
    const result = await safeNativeCall<string>("createPlotHook", [workId, hookContent]);
  }
});

// 修改后 - 保持结构化数据
Tools.register("novelide:create_hook", {
  // ...
  execute: async (params: any) => {
    const hookData = {
      workId,
      title,
      content,
      plantChapter,
      resolveChapter,
      status
    };
    const result = await safeNativeCall<string>("createPlotHook", [workId, JSON.stringify(hookData)]);
  }
});
```

---

## 4. P2 修复步骤

### 4.1 配置化硬编码值

**文件**: `novel_tomato_page.ts`

**修改**:

```typescript
// 修改前
const WORK_MINUTES = 25;
const REST_MINUTES = 5;

// 修改后 - 使用配置
const DEFAULT_CONFIG = {
  workMinutes: 25,
  restMinutes: 5
};

// 从用户设置或本地存储读取
const config = loadTomatoConfig() || DEFAULT_CONFIG;
```

---

### 4.2 添加输入验证

**使用 `requireString` 函数**:

```typescript
import { requireString } from "./novel_utils";

// 在工具执行函数开头验证参数
const workId = requireString(params.workId, "workId");
const title = requireString(params.title, "title");
```

---

### 4.3 统一日志格式

**使用 Logger 工具**:

```typescript
import { Logger } from "./novel_utils";

// 替换 console.log/console.error
Logger.info("操作成功", data);
Logger.warn("警告信息", details);
Logger.error("操作失败", error);
```

---

## 5. 测试验证

### 5.1 单元测试

**运行测试**:

```bash
cd d:\工作区\项目\小说软件\AIGC-NetNov
node --test examples/novelide/tests/novel_tools.test.ts
```

**测试覆盖**:
- 47 个测试用例
- 覆盖所有工具包的基本功能
- 包含边界条件测试

---

### 5.2 集成测试

**在设备上测试**:

1. 编译 TypeScript
```bash
cd examples/novelide
npx tsc
```

2. 部署到设备
```bash
# 使用 ADB 推送文件
adb push dist/ /sdcard/operit/novelide/
```

3. 测试功能
- 创建/获取/更新/删除作品
- 创建/获取/更新/删除章节
- 测试 AI 工具
- 测试导入导出

---

### 5.3 回归测试清单

- [ ] 作品 CRUD 正常工作
- [ ] 章节 CRUD 正常工作
- [ ] 资料管理正常工作
- [ ] AI 工具正常工作
- [ ] 导入导出正常工作
- [ ] 统计数据正确
- [ ] 无内存泄漏
- [ ] 无崩溃

---

**文档维护者**: technical-writer
**最后更新**: 2026-06-22 21:55
