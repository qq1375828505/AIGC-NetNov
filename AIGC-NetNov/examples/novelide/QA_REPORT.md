# AIGC-NetNov 质量保证报告

**审查日期**: 2026-06-22  
**审查员**: qa (QA工程师)  
**审查范围**: AIGC-NetNov 项目 TypeScript 代码质量检查 + 单元测试编写

---

## 一、代码质量检查结果

### 1.1 P0 严重问题（必须修复）

| # | 问题 | 文件 | 影响 |
|---|------|------|------|
| 1 | **get_work 空壳实现** | `novel_works.ts:43-47` | `novelide:get_work` 工具返回空对象 `{}`，未调用 NativeBridge 获取实际数据 |
| 2 | **getCharacterDetail 未定义** | `novel_materials.ts:93` | 调用 `Tools.callNative("getCharacterDetail")` 但 NativeBridge 接口中无此方法 |
| 3 | **getSettingDetail 未定义** | `novel_materials.ts:180` | 同上，NativeBridge 接口缺失 `getSettingDetail` |
| 4 | **getLocationDetail 未定义** | `novel_materials.ts:267` | 同上，NativeBridge 接口缺失 `getLocationDetail` |
| 5 | **getFactionDetail 未定义** | `novel_materials.ts:354` | 同上，NativeBridge 接口缺失 `getFactionDetail` |
| 6 | **getItemDetail 未定义** | `novel_materials.ts:441` | 同上，NativeBridge 接口缺失 `getItemDetail` |
| 7 | **getHookDetail 未定义** | `novel_materials.ts:533` | 同上，NativeBridge 接口缺失 `getHookDetail` |
| 8 | **getReferenceDetail 未定义** | `novel_materials.ts:622` | 同上，NativeBridge 接口缺失 `getReferenceDetail` |
| 9 | **getChapterStats 未定义** | `novel_stats.ts:32` | 调用 `Tools.callNative("getChapterStats")` 但 NativeBridge 接口中无此方法 |
| 10 | **getDailyStats 未定义** | `novel_stats.ts:49` | 调用 `Tools.callNative("getDailyStats")` 但 NativeBridge 接口中无此方法 |

### 1.2 P1 高优先级问题

| # | 问题 | 文件 | 影响 |
|---|------|------|------|
| 1 | **packages 层无错误处理** | `novel_works.ts`, `novel_chapters.ts`, `novel_materials.ts` | 所有工具的 execute 函数无 try-catch，NativeBridge 调用失败会导致未处理异常 |
| 2 | **JSON.parse 无保护** | 多个文件 | 74 处 `JSON.parse()` 调用，多数无 try-catch 保护，非法 JSON 会导致崩溃 |
| 3 | **API 混用** | UI 页面 vs packages | UI 页面使用 `window.NativeBridge`，packages 使用 `Tools.callNative`，两套 API 不一致 |
| 4 | **编辑器自动保存内存泄漏** | `novel_editor_page.ts:18` | `saveTimer` 使用 `let` 声明在组件外部，组件卸载时未清理定时器 |
| 5 | **伏笔创建参数不匹配** | `novel_materials.ts:466-468` vs UI | packages 中 `createPlotHook` 接受 `(workId, content)`，但 UI 中 `title+content` 合并逻辑可能丢失结构化数据 |
| 6 | **番茄钟 timer 泄漏风险** | `novel_tomato_page.ts:72-83` | setInterval 使用闭包引用 `setRemainingSeconds`，但 cleanup 可能不完整 |

### 1.3 P2 中优先级问题

| # | 问题 | 文件 | 影响 |
|---|------|------|------|
| 1 | **硬编码值** | `novel_tomato_page.ts:9-10` | `WORK_MINUTES=25`, `REST_MINUTES=5` 硬编码，应可配置 |
| 2 | **缺少输入验证** | 多个工具 | 工具参数未验证，空字符串、null、undefined 都会被传递给 NativeBridge |
| 3 | **日志不一致** | 多个文件 | 部分使用 `console.error`，部分静默失败（如 `novel_agents.ts:189` 的空 catch） |
| 4 | **缺少 loading 状态** | `novel_io_page.ts` | 导入/导出操作缺少进度反馈 |

---

## 二、NativeBridge 接口缺失清单

以下是 `novel_materials.ts` 中调用但 `native_bridge_init.ts` 中未定义的方法：

```typescript
// 以下方法在 packages 中被调用，但 NativeBridge 接口未声明：
getCharacterDetail(characterId: string): string;    // novel_materials.ts:93
getSettingDetail(settingId: string): string;         // novel_materials.ts:180
getLocationDetail(locationId: string): string;       // novel_materials.ts:267
getFactionDetail(factionId: string): string;         // novel_materials.ts:354
getItemDetail(itemId: string): string;               // novel_materials.ts:441
getHookDetail(hookId: string): string;               // novel_materials.ts:533
getReferenceDetail(referenceId: string): string;     // novel_materials.ts:622

// 以下方法在 stats 工具中被调用，但 NativeBridge 接口未声明：
getChapterStats(workId: string): string;             // novel_stats.ts:32
getDailyStats(workId: string, days: number): string; // novel_stats.ts:49
```

**修复建议**：在 `native_bridge_init.ts` 的 `Window.NativeBridge` 接口中补充上述方法声明，并在 Kotlin 后端实现对应逻辑。

---

## 三、API 使用不一致分析

### 3.1 两套 API 调用方式

| 方式 | 使用位置 | 示例 |
|------|----------|------|
| `window.NativeBridge.xxx()` | UI 页面 | `novel_works_page.ts`, `novel_editor_page.ts` |
| `Tools.callNative("xxx")` | packages 工具 | `novel_works.ts`, `novel_chapters.ts` |
| `Tools.callNative("xxx")` | 部分 UI 页面 | `novel_outline_page.ts`, `novel_skills_page.ts` |

### 3.2 具体不一致

- `novel_outline_page.ts` 使用 `Tools.callNative("getOutlineNodes")` 而非 `window.NativeBridge`
- `novel_skills_page.ts` 使用 `Tools.callNative("getAllSkills")` 而非 `window.NativeBridge`
- `novel_agents_page.ts` 使用 `Tools.callNative("dispatchAgentTask")` 而非 `window.NativeBridge`

**建议**：统一使用 `window.NativeBridge` 或封装统一的服务层。

---

## 四、单元测试编写

### 4.1 测试文件

```
examples/novelide/tests/novel_tools.test.ts
```

### 4.2 测试覆盖范围

| 模块 | 测试用例数 | 覆盖功能 |
|------|-----------|----------|
| novel_works | 6 | 创建、列表、获取、更新、删除作品 |
| novel_chapters | 6 | 创建、列表、获取、保存、删除、排序章节 |
| novel_materials | 13 | 角色/设定/地点/势力/道具/伏笔/参考资料/待办 CRUD |
| novel_stats | 4 | 写作统计、章节统计、每日统计 |
| novel_agents | 6 | Agent 配置验证、调度器、Agent 列表 |
| novel_ai_tools | 7 | 续写、精修、扩写、去AI味、爽点检查、水文检测、标题生成 |
| 边界条件 | 5 | 异常处理、JSON解析失败、空字符串、特殊字符、中文参数 |
| **总计** | **47** | |

### 4.3 测试发现的关键问题

1. **get_work 空壳**：测试确认 `novelide:get_work` 返回空对象 `{}`，未实现实际功能
2. **错误处理缺失**：packages 层工具函数无 try-catch，异常会直接抛出
3. **JSON.parse 无保护**：当 NativeBridge 返回非法 JSON 时会抛出 SyntaxError

---

## 五、安全问题（继承自前期报告）

| 问题 | 严重程度 | 状态 |
|------|----------|------|
| GitHub Token 硬编码 | P0 | 待修复 |
| API Token 硬编码 | P1 | 待修复 |

---

## 六、修复优先级建议

### 立即修复（P0）
1. 补充 NativeBridge 接口缺失的 9 个方法声明
2. 实现 `get_work` 工具的实际功能
3. 撤销并替换所有硬编码 Token

### 短期修复（P1）
4. 为 packages 层工具函数添加 try-catch 错误处理
5. 统一 API 调用方式
6. 修复编辑器自动保存内存泄漏

### 中期优化（P2）
7. 添加输入参数验证
8. 统一日志格式
9. 添加 loading/进度状态

---

## 七、测试运行说明

```bash
# 在项目根目录运行测试
cd d:\工作区\项目\小说软件\AIGC-NetNov
node --test examples/novelide/tests/novel_tools.test.ts
```

注意：测试使用 mock 环境模拟 `Tools` 全局对象，无需实际 Android 运行环境。

---

**报告生成时间**: 2026-06-22 21:25
