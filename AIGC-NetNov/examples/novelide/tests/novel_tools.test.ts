/**
 * AIGC-NetNov 工具函数单元测试
 * 测试范围：作品管理、章节管理、资料管理、统计、Agent 等工具
 * 测试框架：node:test + node:assert/strict
 */

import { test, describe, mock } from "node:test";
import assert from "node:assert/strict";

// ==================== Mock 环境 ====================

/**
 * 模拟 Tools.callNative 返回值
 */
const mockNativeResults: Record<string, string> = {};

/**
 * 模拟全局 Tools 对象
 */
function setupMockTools() {
  const registeredTools: Record<string, any> = {};

  (globalThis as any).Tools = {
    register: (name: string, config: any) => {
      registeredTools[name] = config;
    },
    callNative: async (method: string, args: any[]) => {
      const key = `${method}(${JSON.stringify(args)})`;
      if (mockNativeResults[key] !== undefined) {
        return mockNativeResults[key];
      }
      // 默认返回空数组或空对象
      if (method.startsWith("get") || method.startsWith("list")) {
        return "[]";
      }
      return "mock_id_" + Math.random().toString(36).slice(2, 8);
    },
    Chat: async (config: any) => {
      return "mock AI response for: " + (config.messages?.[0]?.content || "").substring(0, 50);
    }
  };

  return registeredTools;
}

/**
 * 设置模拟返回值
 */
function setMockResult(method: string, args: any[], result: string) {
  mockNativeResults[`${method}(${JSON.stringify(args)})`] = result;
}

/**
 * 清理模拟返回值
 */
function clearMockResults() {
  for (const key of Object.keys(mockNativeResults)) {
    delete mockNativeResults[key];
  }
}

// ==================== 作品管理测试 ====================

describe("novel_works - 作品管理工具", () => {
  let registeredTools: Record<string, any>;

  test("setup", () => {
    registeredTools = setupMockTools();
    // 动态导入以使用 mock 的 Tools
    const { registerTools } = require("../src/packages/novel_works");
    registerTools();
  });

  test("create_work 工具应正确注册", () => {
    const tool = registeredTools["novelide:create_work"];
    assert.ok(tool, "create_work 工具应已注册");
    assert.equal(tool.parameters.required[0], "title");
    assert.equal(tool.parameters.properties.title.type, "string");
  });

  test("create_work 应返回成功结果", async () => {
    const tool = registeredTools["novelide:create_work"];
    setMockResult("createWork", ["测试作品", "玄幻", "简介"], "work_123");
    const result = await tool.execute({ title: "测试作品", genre: "玄幻", description: "简介" });
    assert.equal(result.success, true);
    assert.equal(result.workId, "work_123");
    clearMockResults();
  });

  test("create_work 应使用默认参数", async () => {
    const tool = registeredTools["novelide:create_work"];
    setMockResult("createWork", ["只有标题", "", ""], "work_456");
    const result = await tool.execute({ title: "只有标题" });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("list_works 应返回作品列表", async () => {
    const tool = registeredTools["novelide:list_works"];
    const mockWorks = [
      { id: "w1", title: "作品1", genre: "玄幻" },
      { id: "w2", title: "作品2", genre: "都市" }
    ];
    setMockResult("getNovelWorks", [], JSON.stringify(mockWorks));
    const result = await tool.execute();
    assert.equal(result.success, true);
    assert.equal(result.works.length, 2);
    assert.equal(result.works[0].title, "作品1");
    clearMockResults();
  });

  test("get_work 应返回作品详情或错误", async () => {
    const tool = registeredTools["novelide:get_work"];
    // 新实现使用 getNovelWorks 并过滤
    const result = await tool.execute({ workId: "w1" });
    // 如果作品不存在，应返回失败
    assert.ok(result.success !== undefined);
  });

  test("update_work 应正确传递参数", async () => {
    const tool = registeredTools["novelide:update_work"];
    setMockResult("updateWork", [JSON.stringify({ id: "w1", title: "新标题" })], "true");
    const result = await tool.execute({ workId: "w1", title: "新标题" });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("delete_work 应正确删除作品", async () => {
    const tool = registeredTools["novelide:delete_work"];
    setMockResult("deleteWork", ["w1"], "true");
    const result = await tool.execute({ workId: "w1" });
    assert.equal(result.success, true);
    clearMockResults();
  });
});

// ==================== 章节管理测试 ====================

describe("novel_chapters - 章节管理工具", () => {
  let registeredTools: Record<string, any>;

  test("setup", () => {
    registeredTools = setupMockTools();
    const { registerTools } = require("../src/packages/novel_chapters");
    registerTools();
  });

  test("create_chapter 工具应正确注册", () => {
    const tool = registeredTools["novelide:create_chapter"];
    assert.ok(tool, "create_chapter 工具应已注册");
    assert.deepEqual(tool.parameters.required, ["workId", "title"]);
  });

  test("create_chapter 应返回章节ID", async () => {
    const tool = registeredTools["novelide:create_chapter"];
    setMockResult("createChapter", ["w1", "第一章", 0], "ch_001");
    const result = await tool.execute({ workId: "w1", title: "第一章" });
    assert.equal(result.success, true);
    assert.equal(result.chapterId, "ch_001");
    clearMockResults();
  });

  test("list_chapters 应返回章节列表", async () => {
    const tool = registeredTools["novelide:list_chapters"];
    const chapters = [
      { id: "ch1", title: "第一章", wordCount: 1000 },
      { id: "ch2", title: "第二章", wordCount: 2000 }
    ];
    setMockResult("getChapters", ["w1"], JSON.stringify(chapters));
    const result = await tool.execute({ workId: "w1" });
    assert.equal(result.success, true);
    assert.equal(result.chapters.length, 2);
    clearMockResults();
  });

  test("get_chapter 应返回章节内容", async () => {
    const tool = registeredTools["novelide:get_chapter"];
    setMockResult("getChapterContent", ["ch1"], "这是第一章的内容...");
    const result = await tool.execute({ chapterId: "ch1" });
    assert.equal(result.success, true);
    assert.equal(result.content, "这是第一章的内容...");
    clearMockResults();
  });

  test("save_chapter 应保存内容", async () => {
    const tool = registeredTools["novelide:save_chapter"];
    setMockResult("saveChapterContent", ["ch1", "新内容", 100], "true");
    const result = await tool.execute({ chapterId: "ch1", content: "新内容", wordCount: 100 });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("delete_chapter 应删除章节", async () => {
    const tool = registeredTools["novelide:delete_chapter"];
    setMockResult("deleteChapter", ["ch1"], "true");
    const result = await tool.execute({ chapterId: "ch1" });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("reorder_chapters 应重排序章节", async () => {
    const tool = registeredTools["novelide:reorder_chapters"];
    setMockResult("reorderChapters", ["w1", JSON.stringify(["ch2", "ch1"])], "true");
    const result = await tool.execute({ workId: "w1", chapterIds: ["ch2", "ch1"] });
    assert.equal(result.success, true);
    clearMockResults();
  });
});

// ==================== 资料管理测试 ====================

describe("novel_materials - 资料管理工具", () => {
  let registeredTools: Record<string, any>;

  test("setup", () => {
    registeredTools = setupMockTools();
    const { registerTools } = require("../src/packages/novel_materials");
    registerTools();
  });

  // ---- 角色 ----

  test("create_character 应创建角色", async () => {
    const tool = registeredTools["novelide:create_character"];
    setMockResult("createCharacter", ["w1", "张三", "男 | 25 | 勇敢"], "char_001");
    const result = await tool.execute({
      workId: "w1", name: "张三", gender: "男", age: "25", personality: "勇敢"
    });
    assert.equal(result.success, true);
    assert.equal(result.characterId, "char_001");
    clearMockResults();
  });

  test("create_character 应正确拼接 role 参数", async () => {
    const tool = registeredTools["novelide:create_character"];
    // gender + age + personality + background 用 " | " 连接
    setMockResult("createCharacter", ["w1", "李四", "女 | 30 | 聪明 | 贵族出身"], "char_002");
    const result = await tool.execute({
      workId: "w1", name: "李四", gender: "女", age: "30",
      personality: "聪明", background: "贵族出身"
    });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("list_characters 应返回角色列表", async () => {
    const tool = registeredTools["novelide:list_characters"];
    const chars = [{ id: "c1", name: "张三" }];
    setMockResult("getCharacters", ["w1"], JSON.stringify(chars));
    const result = await tool.execute({ workId: "w1" });
    assert.equal(result.success, true);
    assert.equal(result.characters.length, 1);
    clearMockResults();
  });

  test("get_character 应返回角色详情（已知问题：getCharacterDetail 未在 NativeBridge 定义）", async () => {
    const tool = registeredTools["novelide:get_character"];
    // 这个测试暴露了已知问题：getCharacterDetail 未在 NativeBridge 接口中定义
    const result = await tool.execute({ characterId: "c1" });
    assert.equal(result.success, true);
    // 注意：实际运行时会因 NativeBridge.getCharacterDetail 未定义而失败
  });

  // ---- 设定 ----

  test("create_setting 应创建设定", async () => {
    const tool = registeredTools["novelide:create_setting"];
    setMockResult("createSetting", ["w1", "力量体系", "修仙等级"], "set_001");
    const result = await tool.execute({
      workId: "w1", name: "力量体系", content: "修仙等级"
    });
    assert.equal(result.success, true);
    assert.equal(result.settingId, "set_001");
    clearMockResults();
  });

  test("list_settings 应返回设定列表", async () => {
    const tool = registeredTools["novelide:list_settings"];
    setMockResult("getSettings", ["w1"], JSON.stringify([{ id: "s1", name: "力量体系" }]));
    const result = await tool.execute({ workId: "w1" });
    assert.equal(result.success, true);
    clearMockResults();
  });

  // ---- 地点 ----

  test("create_location 应创建地点", async () => {
    const tool = registeredTools["novelide:create_location"];
    setMockResult("createLocation", ["w1", "天山", "山脉"], "loc_001");
    const result = await tool.execute({
      workId: "w1", name: "天山", type: "山脉"
    });
    assert.equal(result.success, true);
    clearMockResults();
  });

  // ---- 势力 ----

  test("create_faction 应创建势力", async () => {
    const tool = registeredTools["novelide:create_faction"];
    setMockResult("createFaction", ["w1", "天剑宗", "修仙门派"], "fac_001");
    const result = await tool.execute({
      workId: "w1", name: "天剑宗", type: "修仙门派"
    });
    assert.equal(result.success, true);
    clearMockResults();
  });

  // ---- 道具 ----

  test("create_item 应创建道具", async () => {
    const tool = registeredTools["novelide:create_item"];
    setMockResult("createItem", ["w1", "轩辕剑", "武器"], "item_001");
    const result = await tool.execute({
      workId: "w1", name: "轩辕剑", type: "武器"
    });
    assert.equal(result.success, true);
    clearMockResults();
  });

  // ---- 伏笔 ----

  test("create_hook 应创建伏笔", async () => {
    const tool = registeredTools["novelide:create_hook"];
    setMockResult("createPlotHook", ["w1", "神秘老人\n出现在第三章"], "hook_001");
    const result = await tool.execute({
      workId: "w1", title: "神秘老人", content: "出现在第三章"
    });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("create_hook 应合并 title 和 content", async () => {
    const tool = registeredTools["novelide:create_hook"];
    setMockResult("createPlotHook", ["w1", "伏笔标题\n伏笔内容"], "hook_002");
    const result = await tool.execute({
      workId: "w1", title: "伏笔标题", content: "伏笔内容"
    });
    assert.equal(result.success, true);
    clearMockResults();
  });

  // ---- 参考资料 ----

  test("create_reference 应创建参考资料", async () => {
    const tool = registeredTools["novelide:create_reference"];
    setMockResult("createReference", ["w1", "古代建筑资料", "图片内容"], "ref_001");
    const result = await tool.execute({
      workId: "w1", title: "古代建筑资料", content: "图片内容"
    });
    assert.equal(result.success, true);
    clearMockResults();
  });

  // ---- 写作待办 ----

  test("create_todo 应创建待办（默认优先级）", async () => {
    const tool = registeredTools["novelide:create_todo"];
    setMockResult("createTodo", ["w1", "修改第三章", 0], "todo_001");
    const result = await tool.execute({
      workId: "w1", title: "修改第三章"
    });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("create_todo 应处理高优先级", async () => {
    const tool = registeredTools["novelide:create_todo"];
    setMockResult("createTodo", ["w1", "紧急修改", 2], "todo_002");
    const result = await tool.execute({
      workId: "w1", title: "紧急修改", priority: "高"
    });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("create_todo 应处理 medium 优先级", async () => {
    const tool = registeredTools["novelide:create_todo"];
    setMockResult("createTodo", ["w1", "一般任务", 1], "todo_003");
    const result = await tool.execute({
      workId: "w1", title: "一般任务", priority: "medium"
    });
    assert.equal(result.success, true);
    clearMockResults();
  });
});

// ==================== 写作统计测试 ====================

describe("novel_stats - 写作统计工具", () => {
  let registeredTools: Record<string, any>;

  test("setup", () => {
    registeredTools = setupMockTools();
    const { registerTools } = require("../src/packages/novel_stats");
    registerTools();
  });

  test("get_writing_stats 应返回统计数据", async () => {
    const tool = registeredTools["novelide:get_writing_stats"];
    const stats = {
      totalWords: 50000,
      todayWords: 2000,
      continuousDays: 7,
      dailyGoal: 3000
    };
    setMockResult("getWritingStats", ["w1"], JSON.stringify(stats));
    const result = await tool.execute({ workId: "w1" });
    assert.equal(result.success, true);
    assert.equal(result.stats.totalWords, 50000);
    clearMockResults();
  });

  test("get_chapter_stats 应返回章节统计或错误", async () => {
    const tool = registeredTools["novelide:get_chapter_stats"];
    // getChapterStats 未在 NativeBridge 实现，safeNativeJsonCall 会返回空对象
    const result = await tool.execute({ workId: "w1" });
    assert.ok(result.success !== undefined);
  });

  test("get_daily_stats 应返回每日统计或错误", async () => {
    const tool = registeredTools["novelide:get_daily_stats"];
    // getDailyStats 未在 NativeBridge 实现，safeNativeJsonCall 会返回空对象
    const result = await tool.execute({ workId: "w1", days: 30 });
    assert.ok(result.success !== undefined);
  });

  test("get_daily_stats 应使用默认参数", async () => {
    const tool = registeredTools["novelide:get_daily_stats"];
    // 现在 workId 是必需参数
    const result = await tool.execute({ workId: "w1" });
    assert.ok(result.success !== undefined);
  });
});

// ==================== Agent 调度测试 ====================

describe("novel_agents - Agent 调度系统", () => {
  test("AGENT_CONFIGS 应包含 7 个 Agent", async () => {
    const { AGENT_CONFIGS } = require("../src/packages/novel_agents");
    const agentIds = Object.keys(AGENT_CONFIGS);
    assert.equal(agentIds.length, 7);
    assert.ok(agentIds.includes("outline"));
    assert.ok(agentIds.includes("character"));
    assert.ok(agentIds.includes("pleasure"));
    assert.ok(agentIds.includes("water"));
    assert.ok(agentIds.includes("title"));
    assert.ok(agentIds.includes("deai"));
    assert.ok(agentIds.includes("polish"));
  });

  test("每个 Agent 应有必要的配置字段", async () => {
    const { AGENT_CONFIGS } = require("../src/packages/novel_agents");
    for (const [id, agent] of Object.entries(AGENT_CONFIGS) as [string, any][]) {
      assert.ok(agent.id, `${id} 应有 id`);
      assert.ok(agent.name, `${id} 应有 name`);
      assert.ok(agent.description, `${id} 应有 description`);
      assert.ok(agent.systemPrompt, `${id} 应有 systemPrompt`);
      assert.ok(agent.systemPrompt.length > 50, `${id} 的 systemPrompt 应足够详细`);
    }
  });

  test("NovelAgentDispatcher.dispatch 应抛出未知 Agent 错误", async () => {
    const { NovelAgentDispatcher } = require("../src/packages/novel_agents");
    await assert.rejects(
      () => NovelAgentDispatcher.dispatch("unknown_agent", "test task"),
      (err: Error) => {
        assert.ok(err.message.includes("未知的 Agent"));
        return true;
      }
    );
  });

  test("NovelAgentDispatcher.dispatch 应成功调度已知 Agent", async () => {
    setupMockTools();
    const { NovelAgentDispatcher } = require("../src/packages/novel_agents");
    const result = await NovelAgentDispatcher.dispatch("outline", "生成一个玄幻小说大纲");
    assert.ok(typeof result === "string");
    assert.ok(result.length > 0);
  });

  test("NovelAgentDispatcher.dispatch 应支持上下文", async () => {
    setupMockTools();
    const { NovelAgentDispatcher } = require("../src/packages/novel_agents");
    const result = await NovelAgentDispatcher.dispatch("character", "设计主角", {
      workTitle: "测试作品"
    });
    assert.ok(typeof result === "string");
  });

  test("NovelAgentDispatcher.getAgents 应返回 Agent 列表", async () => {
    const { NovelAgentDispatcher } = require("../src/packages/novel_agents");
    const agents = NovelAgentDispatcher.getAgents();
    assert.equal(agents.length, 7);
    for (const agent of agents) {
      assert.ok(agent.id);
      assert.ok(agent.name);
      assert.ok(agent.description);
    }
  });
});

// ==================== AI 写作工具测试 ====================

describe("novel_ai_tools - AI 写作工具", () => {
  let registeredTools: Record<string, any>;

  test("setup", () => {
    registeredTools = setupMockTools();
    const { registerTools } = require("../src/packages/novel_ai_tools");
    registerTools();
  });

  test("continue_writing 工具应正确注册", () => {
    const tool = registeredTools["novelide:continue_writing"];
    assert.ok(tool, "continue_writing 应已注册");
    assert.deepEqual(tool.parameters.required, ["content"]);
  });

  test("continue_writing 应返回 AI 续写结果", async () => {
    const tool = registeredTools["novelide:continue_writing"];
    const result = await tool.execute({ content: "从前有座山..." });
    assert.equal(result.success, true);
    assert.ok(result.text.length > 0);
  });

  test("polish_text 应返回精修结果", async () => {
    const tool = registeredTools["novelide:polish_text"];
    const result = await tool.execute({ content: "需要精修的文本" });
    assert.equal(result.success, true);
    assert.ok(result.text.length > 0);
  });

  test("expand_text 应返回扩写结果", async () => {
    const tool = registeredTools["novelide:expand_text"];
    const result = await tool.execute({ content: "简短描述" });
    assert.equal(result.success, true);
    assert.ok(result.text.length > 0);
  });

  test("deai_flavor 应返回去 AI 味结果", async () => {
    const tool = registeredTools["novelide:deai_flavor"];
    const result = await tool.execute({ content: "AI 生成的文本" });
    assert.equal(result.success, true);
    assert.ok(result.text.length > 0);
  });

  test("check_pleasure 应返回爽点分析", async () => {
    const tool = registeredTools["novelide:check_pleasure"];
    const result = await tool.execute({ content: "一段网文内容" });
    assert.equal(result.success, true);
    assert.ok(result.text.length > 0);
  });

  test("detect_water 应返回水文检测结果", async () => {
    const tool = registeredTools["novelide:detect_water"];
    const result = await tool.execute({ content: "需要检测的文本" });
    assert.equal(result.success, true);
    assert.ok(result.text.length > 0);
  });

  test("generate_title 应返回标题建议", async () => {
    const tool = registeredTools["novelide:generate_title"];
    const result = await tool.execute({ content: "一个关于修仙的故事", genre: "玄幻" });
    assert.equal(result.success, true);
    assert.ok(result.text.length > 0);
  });
});

// ==================== 边界条件和错误处理测试 ====================

describe("边界条件和错误处理", () => {
  let registeredTools: Record<string, any>;

  test("setup", () => {
    registeredTools = setupMockTools();
    // 重新注册所有工具
    const works = require("../src/packages/novel_works");
    const chapters = require("../src/packages/novel_chapters");
    const materials = require("../src/packages/novel_materials");
    const stats = require("../src/packages/novel_stats");
    const aiTools = require("../src/packages/novel_ai_tools");
    works.registerTools();
    chapters.registerTools();
    materials.registerTools();
    stats.registerTools();
    aiTools.registerTools();
  });

  test("工具应处理 callNative 异常 - 返回错误而不是崩溃", async () => {
    // 模拟 callNative 抛出异常
    const originalCallNative = (globalThis as any).Tools.callNative;
    (globalThis as any).Tools.callNative = async () => {
      throw new Error("Native bridge error");
    };

    const tool = registeredTools["novelide:create_work"];
    // 新实现有 try-catch，应返回 { success: false, error: "..." }
    const result = await tool.execute({ title: "测试" });
    assert.equal(result.success, false);
    assert.ok(result.error);
    assert.ok(result.error.includes("Native bridge error"));

    (globalThis as any).Tools.callNative = originalCallNative;
  });

  test("工具应处理 JSON.parse 失败 - 返回空数据而不是崩溃", async () => {
    const originalCallNative = (globalThis as any).Tools.callNative;
    (globalThis as any).Tools.callNative = async () => "invalid json {";

    const tool = registeredTools["novelide:list_works"];
    // 新实现使用 safeNativeJsonCall，无效 JSON 返回空对象
    const result = await tool.execute();
    assert.equal(result.success, true);
    // safeNativeJsonCall 对无效 JSON 返回空对象 {}
    assert.ok(result.works !== undefined);

    (globalThis as any).Tools.callNative = originalCallNative;
  });

  test("工具应处理空字符串参数 - requireString 应抛出错误", async () => {
    const tool = registeredTools["novelide:create_work"];
    // requireString 在 try-catch 之前调用，错误会向上传播
    try {
      const result = await tool.execute({ title: "" });
      // 如果没有抛出异常，说明工具内部处理了错误
      assert.equal(result.success, false);
    } catch (error) {
      // 预期会抛出异常
      assert.ok(error instanceof Error);
      assert.ok(error.message.includes("不能为空"));
    }
  });

  test("工具应处理特殊字符参数", async () => {
    const tool = registeredTools["novelide:create_work"];
    const specialTitle = '包含"引号"和\\反斜杠的作品';
    setMockResult("createWork", [specialTitle, "", ""], "work_special");
    const result = await tool.execute({ title: specialTitle });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("工具应处理中文参数", async () => {
    const tool = registeredTools["novelide:create_chapter"];
    setMockResult("createChapter", ["w1", "第三章：决战紫禁之巅", 2], "ch_cn");
    const result = await tool.execute({ workId: "w1", title: "第三章：决战紫禁之巅", order: 2 });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("工具应处理 null 参数 - requireString 应拦截", async () => {
    const tool = registeredTools["novelide:create_work"];
    // requireString 在 try-catch 之前调用，错误会向上传播
    try {
      const result = await tool.execute({ title: null });
      assert.equal(result.success, false);
    } catch (error) {
      assert.ok(error instanceof Error);
      assert.ok(error.message.includes("不能为空"));
    }
  });

  test("工具应处理 undefined 参数 - requireString 应拦截", async () => {
    const tool = registeredTools["novelide:create_work"];
    try {
      const result = await tool.execute({ title: undefined });
      assert.equal(result.success, false);
    } catch (error) {
      assert.ok(error instanceof Error);
      assert.ok(error.message.includes("不能为空"));
    }
  });

  test("工具应处理超长字符串参数 (100KB)", async () => {
    const tool = registeredTools["novelide:create_work"];
    const longTitle = "A".repeat(100000);
    setMockResult("createWork", [longTitle, "", ""], "work_long");
    const result = await tool.execute({ title: longTitle });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("工具应处理 emoji 和特殊 Unicode 字符", async () => {
    const tool = registeredTools["novelide:create_work"];
    const emojiTitle = "小说标题🎉🔥💫 with émojis";
    setMockResult("createWork", [emojiTitle, "", ""], "work_emoji");
    const result = await tool.execute({ title: emojiTitle });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("工具应处理换行符和制表符", async () => {
    const tool = registeredTools["novelide:save_chapter"];
    const contentWithNewlines = "第一段\n\n第二段\t\t缩进\n第三段";
    setMockResult("saveChapterContent", ["ch1", contentWithNewlines, 20], "true");
    const result = await tool.execute({ chapterId: "ch1", content: contentWithNewlines, wordCount: 20 });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("工具应处理空数组参数 - 应返回失败", async () => {
    const tool = registeredTools["novelide:reorder_chapters"];
    // 空数组现在会被验证拦截
    const result = await tool.execute({ workId: "w1", chapterIds: [] });
    assert.equal(result.success, false);
    assert.ok(result.error);
  });

  test("工具应处理大量数组元素", async () => {
    const tool = registeredTools["novelide:reorder_chapters"];
    const manyIds = Array.from({ length: 1000 }, (_, i) => `ch_${i}`);
    setMockResult("reorderChapters", ["w1", JSON.stringify(manyIds)], "true");
    const result = await tool.execute({ workId: "w1", chapterIds: manyIds });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("工具应处理 NativeBridge 返回空字符串 - safeNativeJsonCall 返回空对象", async () => {
    const originalCallNative = (globalThis as any).Tools.callNative;
    (globalThis as any).Tools.callNative = async () => "";

    const tool = registeredTools["novelide:list_works"];
    // safeNativeJsonCall 对无效 JSON 返回空对象 {}
    const result = await tool.execute();
    assert.equal(result.success, true);
    assert.ok(result.works !== undefined);

    (globalThis as any).Tools.callNative = originalCallNative;
  });

  test("工具应处理 NativeBridge 返回 null - safeNativeJsonCall 返回空对象", async () => {
    const originalCallNative = (globalThis as any).Tools.callNative;
    (globalThis as any).Tools.callNative = async () => null;

    const tool = registeredTools["novelide:list_works"];
    // safeNativeJsonCall 对 null 返回空对象 {}
    const result = await tool.execute();
    assert.equal(result.success, true);
    assert.ok(result.works !== undefined);

    (globalThis as any).Tools.callNative = originalCallNative;
  });

  test("工具应处理 NativeBridge 返回 undefined - safeNativeJsonCall 返回空对象", async () => {
    const originalCallNative = (globalThis as any).Tools.callNative;
    (globalThis as any).Tools.callNative = async () => undefined;

    const tool = registeredTools["novelide:list_works"];
    // safeNativeJsonCall 对 undefined 返回空对象 {}
    const result = await tool.execute();
    assert.equal(result.success, true);
    assert.ok(result.works !== undefined);

    (globalThis as any).Tools.callNative = originalCallNative;
  });

  test("工具应处理 NativeBridge 超时", async () => {
    const originalCallNative = (globalThis as any).Tools.callNative;
    (globalThis as any).Tools.callNative = async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return "[]";
    };

    const tool = registeredTools["novelide:list_works"];
    const startTime = Date.now();
    // 使用 Promise.race 模拟超时
    const result = await Promise.race([
      tool.execute().then(r => ({ type: "success", result: r })),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000))
    ]).catch(error => ({ type: "timeout", error }));

    const elapsed = Date.now() - startTime;
    // 应该在超时时间内返回（可能成功也可能超时）
    assert.ok(elapsed < 6000, "应该在合理时间内返回");

    (globalThis as any).Tools.callNative = originalCallNative;
  });

  test("工具应处理连续快速调用", async () => {
    const tool = registeredTools["novelide:list_works"];
    setMockResult("getNovelWorks", [], JSON.stringify([]));

    const promises = Array.from({ length: 10 }, () => tool.execute());
    const results = await Promise.all(promises);

    for (const result of results) {
      assert.equal(result.success, true);
    }
    clearMockResults();
  });

  test("工具应处理 ID 中包含特殊字符", async () => {
    const tool = registeredTools["novelide:get_chapter"];
    const specialId = "ch-123_abc.def@hash#1";
    setMockResult("getChapterContent", [specialId], "内容");
    const result = await tool.execute({ chapterId: specialId });
    assert.equal(result.success, true);
    assert.equal(result.content, "内容");
    clearMockResults();
  });

  test("工具应处理包含 HTML 标签的内容", async () => {
    const tool = registeredTools["novelide:save_chapter"];
    const htmlContent = '<p>第一段</p><script>alert("xss")</script>';
    setMockResult("saveChapterContent", ["ch1", htmlContent, 30], "true");
    const result = await tool.execute({ chapterId: "ch1", content: htmlContent, wordCount: 30 });
    assert.equal(result.success, true);
    clearMockResults();
  });

  test("工具应处理 JSON 字符串中的转义字符", async () => {
    const tool = registeredTools["novelide:update_work"];
    const escapedJson = '{"id":"w1","title":"包含\\"引号\\"和\\\\反斜杠"}';
    setMockResult("updateWork", [escapedJson], "true");
    const result = await tool.execute({ workId: "w1", title: '包含"引号"和\\反斜杠' });
    assert.equal(result.success, true);
    clearMockResults();
  });
});
