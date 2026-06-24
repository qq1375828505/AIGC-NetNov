# AIGC-NetNov 问题清单

> **项目**: AIGC-NetNov (网文写作IDE)
> **版本**: 0.1.0
> **最后更新**: 2026-06-22
> **状态**: 开发中

---

## 目录

- [1. 问题统计](#1-问题统计)
- [2. P0 严重问题](#2-p0-严重问题)
- [3. P1 高优先级问题](#3-p1-高优先级问题)
- [4. P2 中优先级问题](#4-p2-中优先级问题)
- [5. 已知限制](#5-已知限制)
- [6. 修复进度跟踪](#6-修复进度跟踪)

---

## 1. 问题统计

| 优先级 | 数量 | 状态 |
|--------|------|------|
| P0 (严重) | 16 | 待修复 |
| P1 (高) | 13 | 待修复 |
| P2 (中) | 6 | 待修复 |
| **总计** | **35** | |

---

## 2. P0 严重问题

### 2.1 NativeBridge 接口缺失 (9个)

**问题描述**: TypeScript 前端调用了 9 个 NativeBridge 方法，但这些方法在 Kotlin 后端中未实现。

**影响**: 调用这些方法会导致运行时错误或返回空数据。

| # | 方法名 | 调用位置 | 后端状态 |
|---|--------|----------|----------|
| 1 | `getCharacterDetail` | `novel_materials.ts:93` | 未实现 |
| 2 | `getSettingDetail` | `novel_materials.ts:180` | 未实现 |
| 3 | `getLocationDetail` | `novel_materials.ts:267` | 未实现 |
| 4 | `getFactionDetail` | `novel_materials.ts:354` | 未实现 |
| 5 | `getItemDetail` | `novel_materials.ts:441` | 未实现 |
| 6 | `getHookDetail` | `novel_materials.ts:533` | 未实现 |
| 7 | `getReferenceDetail` | `novel_materials.ts:622` | 未实现 |
| 8 | `getChapterStats` | `novel_stats.ts:32` | 未实现 |
| 9 | `getDailyStats` | `novel_stats.ts:49` | 未实现 |

**修复建议**:
1. 在 `NovelNativeBridge.kt` 中添加上述 9 个方法的实现
2. 或者在 TypeScript 层使用已有的 `getCharacters` 等列表方法 + 过滤来获取详情

---

### 2.2 get_work 空壳实现 (1个)

**问题描述**: `novelide:get_work` 工具返回空对象 `{}`，未调用 NativeBridge 获取实际数据。

**文件**: `novel_works.ts:43-47`

**影响**: 获取单个作品详情功能完全不可用。

**当前代码**:
```typescript
// novel_works.ts:43-47
execute: async (params: any) => {
  // TODO: 实现实际逻辑
  return {};
}
```

**修复建议**: 实现实际的 NativeBridge 调用逻辑。

---

### 2.3 硬编码敏感信息 (2个)

**问题描述**: 代码中存在硬编码的敏感信息。

| # | 问题 | 文件 | 严重程度 |
|---|------|------|----------|
| 1 | GitHub Token 硬编码 | 待确认 | P0 |
| 2 | API Token 硬编码 | 待确认 | P1 |

**修复建议**:
1. 立即撤销已泄露的 Token
2. 使用环境变量或安全存储方式管理敏感信息
3. 添加 `.gitignore` 规则防止意外提交

---

### 2.4 Tools.callNative 调用失败 (4个)

**问题描述**: 部分 Packages 中的工具使用 `Tools.callNative` 调用不存在的方法。

| # | 工具名 | 调用方法 | 文件 |
|---|--------|----------|------|
| 1 | `novelide:get_character` | `getCharacterDetail` | `novel_materials.ts:124` |
| 2 | `novelide:get_setting` | `getSettingDetail` | `novel_materials.ts:245` |
| 3 | `novelide:get_location` | `getLocationDetail` | `novel_materials.ts:366` |
| 4 | `novelide:get_faction` | `getFactionDetail` | `novel_materials.ts:487` |

**修复建议**: 统一使用 `getCharacters` 等列表方法 + 过滤，或实现详情方法。

---

## 3. P1 高优先级问题

### 3.1 错误处理缺失 (6个)

**问题描述**: Packages 层工具函数缺少 try-catch 错误处理。

| # | 文件 | 问题描述 |
|---|------|----------|
| 1 | `novel_works.ts` | 所有工具无 try-catch |
| 2 | `novel_chapters.ts` | 所有工具无 try-catch |
| 3 | `novel_materials.ts` | 所有工具无 try-catch |
| 4 | `novel_stats.ts` | 所有工具无 try-catch |
| 5 | `novel_io.ts` | 所有工具无 try-catch |
| 6 | `novel_agents.ts` | 所有工具无 try-catch |

**影响**: NativeBridge 调用失败会导致未处理异常，影响用户体验。

**修复建议**: 为所有工具的 execute 函数添加 try-catch 错误处理。

---

### 3.2 JSON.parse 无保护 (74处)

**问题描述**: 74 处 `JSON.parse()` 调用无 try-catch 保护。

**影响**: 非法 JSON 字符串会导致应用崩溃。

**修复建议**:
1. 使用 `novel_utils.ts` 中的 `safeJsonParse` 函数
2. 或为所有 `JSON.parse` 调用添加 try-catch

---

### 3.3 API 调用方式不一致 (3个)

**问题描述**: 项目中存在两种 API 调用方式，导致代码风格不一致。

| 方式 | 使用位置 | 示例 |
|------|----------|------|
| `window.NativeBridge.xxx()` | UI 页面 | `novel_works_page.ts` |
| `Tools.callNative("xxx")` | Packages | `novel_works.ts` |

**不一致的具体位置**:
1. `novel_outline_page.ts` 使用 `Tools.callNative` 而非 `window.NativeBridge`
2. `novel_skills_page.ts` 使用 `Tools.callNative` 而非 `window.NativeBridge`
3. `novel_agents_page.ts` 使用 `Tools.callNative` 而非 `window.NativeBridge`

**修复建议**: 统一使用 `window.NativeBridge` 或封装统一的服务层。

---

### 3.4 内存泄漏风险 (2个)

**问题描述**: 存在定时器未清理导致的内存泄漏风险。

| # | 文件 | 问题描述 |
|---|------|----------|
| 1 | `novel_editor_page.ts:18` | `saveTimer` 使用 `let` 声明在组件外部，组件卸载时未清理定时器 |
| 2 | `novel_tomato_page.ts:72-83` | `setInterval` 使用闭包引用 `setRemainingSeconds`，cleanup 可能不完整 |

**修复建议**:
1. 在组件卸载时清理所有定时器
2. 使用 `useEffect` 的 cleanup 函数管理定时器生命周期

---

### 3.5 参数不匹配 (1个)

**问题描述**: 伏笔创建参数不匹配。

**文件**: `novel_materials.ts:466-468` vs UI

**问题**: Packages 中 `createPlotHook` 接受 `(workId, content)`，但 UI 中 `title+content` 合并逻辑可能丢失结构化数据。

**修复建议**: 统一参数格式，确保数据完整性。

---

### 3.6 空 catch 块 (1个)

**问题描述**: 存在空的 catch 块，错误被静默忽略。

**文件**: `novel_agents.ts:189`

**代码**:
```typescript
try {
  // ...
} catch (e) {
  // 空 catch，错误被忽略
}
```

**修复建议**: 添加错误日志或适当的错误处理。

---

## 4. P2 中优先级问题

### 4.1 硬编码值 (1个)

**问题描述**: 番茄钟参数硬编码。

**文件**: `novel_tomato_page.ts:9-10`

**硬编码值**:
```typescript
const WORK_MINUTES = 25;  // 工作时间
const REST_MINUTES = 5;   // 休息时间
```

**修复建议**: 将这些值移到配置文件或用户设置中。

---

### 4.2 缺少输入验证 (多个)

**问题描述**: 多个工具的参数未验证。

**影响**: 空字符串、null、undefined 都会被传递给 NativeBridge。

**修复建议**:
1. 使用 `novel_utils.ts` 中的 `requireString` 函数
2. 在工具注册时添加参数验证

---

### 4.3 日志不一致 (多个)

**问题描述**: 部分使用 `console.error`，部分静默失败。

**修复建议**: 统一使用 `novel_utils.ts` 中的 `Logger` 工具。

---

### 4.4 缺少 loading 状态 (1个)

**问题描述**: 导入/导出操作缺少进度反馈。

**文件**: `novel_io_page.ts`

**修复建议**: 添加加载状态和进度指示器。

---

## 5. 已知限制

### 5.1 架构限制

1. **同步调用**: Kotlin 后端使用 `runBlocking` 同步执行所有操作，可能阻塞 UI 线程
2. **WebView 依赖**: NativeBridge 依赖 Android WebView 的 JavaScript 接口
3. **数据格式**: 所有数据通过 JSON 字符串传输，存在序列化/反序列化开销

### 5.2 功能限制

1. **大纲管理**: 只有更新和重排节点的方法，缺少创建和删除
2. **Agent 系统**: `sendAgentTask` 和 `getAgentResult` 返回固定状态，未实际处理任务
3. **番茄记录**: `recordTomatoComplete` 只返回成功状态，未实际记录数据

---

## 6. 修复进度跟踪

| # | 问题 | 优先级 | 状态 | 负责人 | 备注 |
|---|------|--------|------|--------|------|
| 1 | NativeBridge 接口缺失 | P0 | 待修复 | backend-architect | 需要 Kotlin 实现 |
| 2 | get_work 空壳 | P0 | 待修复 | frontend-dev | 需要实现逻辑 |
| 3 | 硬编码敏感信息 | P0 | 待修复 | 全团队 | 需要立即处理 |
| 4 | Tools.callNative 失败 | P0 | 待修复 | frontend-dev | 统一调用方式 |
| 5 | 错误处理缺失 | P1 | 待修复 | frontend-dev | 添加 try-catch |
| 6 | JSON.parse 无保护 | P1 | 待修复 | frontend-dev | 使用 safeJsonParse |
| 7 | API 调用不一致 | P1 | 待修复 | frontend-dev | 统一风格 |
| 8 | 内存泄漏风险 | P1 | 待修复 | frontend-dev | 清理定时器 |
| 9 | 参数不匹配 | P1 | 待修复 | frontend-dev | 统一参数 |
| 10 | 空 catch 块 | P1 | 待修复 | frontend-dev | 添加日志 |
| 11 | 硬编码值 | P2 | 待修复 | frontend-dev | 配置化 |
| 12 | 输入验证缺失 | P2 | 待修复 | frontend-dev | 添加验证 |
| 13 | 日志不一致 | P2 | 待修复 | frontend-dev | 统一 Logger |
| 14 | 缺少 loading 状态 | P2 | 待修复 | frontend-dev | 添加 UI |

---

**文档维护者**: technical-writer
**最后更新**: 2026-06-22 21:55
**数据来源**: code-reviewer, api-tester, QA_REPORT.md
