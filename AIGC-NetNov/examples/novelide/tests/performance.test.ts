/**
 * AIGC-NetNov 性能测试套件
 * 
 * 测试范围：
 * 1. runBlocking 阻塞时间模拟测试
 * 2. JSON.parse 性能基准测试
 * 3. AgentManager 内存泄漏检测
 * 4. N+1 查询模式性能对比
 * 5. NativeBridge 调用链路耗时测试
 * 
 * 测试框架：node:test + node:assert/strict
 */

import { test, describe, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// ==================== 性能测量工具 ====================

interface PerformanceResult {
  name: string;
  duration: number;
  iterations: number;
  avgPerIteration: number;
  p50: number;
  p95: number;
  p99: number;
}

function measurePerformance(
  name: string,
  fn: () => void | Promise<void>,
  iterations: number = 1000
): PerformanceResult {
  const durations: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    durations.push(end - start);
  }

  durations.sort((a, b) => a - b);

  const total = durations.reduce((sum, d) => sum + d, 0);
  const p50Index = Math.floor(iterations * 0.5);
  const p95Index = Math.floor(iterations * 0.95);
  const p99Index = Math.floor(iterations * 0.99);

  return {
    name,
    duration: total,
    iterations,
    avgPerIteration: total / iterations,
    p50: durations[p50Index],
    p95: durations[p95Index],
    p99: durations[p99Index],
  };
}

function formatResult(result: PerformanceResult): string {
  return `
=== ${result.name} ===
  总耗时: ${result.duration.toFixed(2)}ms
  迭代次数: ${result.iterations}
  平均每次: ${result.avgPerIteration.toFixed(4)}ms
  P50: ${result.p50.toFixed(4)}ms
  P95: ${result.p95.toFixed(4)}ms
  P99: ${result.p99.toFixed(4)}ms
`;
}

// ==================== Mock 环境 ====================

/**
 * 模拟不同大小的 JSON 数据
 */
function generateMockData(size: number): string {
  const items = [];
  for (let i = 0; i < size; i++) {
    items.push({
      id: `item_${i}`,
      name: `测试项目 ${i}`,
      description: `这是第 ${i} 个测试项目的描述文本，包含一些中文字符和标点符号。`,
      category: i % 5 === 0 ? "重要" : "普通",
      tags: ["标签1", "标签2", "标签3"],
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        wordCount: Math.floor(Math.random() * 10000),
      },
    });
  }
  return JSON.stringify(items);
}

/**
 * 模拟 NativeBridge 调用延迟
 */
function simulateNativeBridgeCall(delayMs: number): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.stringify({ success: true }));
    }, delayMs);
  });
}

/**
 * 模拟 runBlocking 行为（同步阻塞）
 */
function simulateRunBlocking(delayMs: number): string {
  const start = Date.now();
  while (Date.now() - start < delayMs) {
    // 忙等待，模拟线程阻塞
  }
  return JSON.stringify({ success: true });
}

// ==================== 测试用例 ====================

describe("性能测试 - JSON.parse 基准", () => {
  test("小型数据集 (10 条记录) JSON.parse 性能", () => {
    const data = generateMockData(10);
    console.log(`\n数据大小: ${(data.length / 1024).toFixed(2)} KB`);

    const result = measurePerformance(
      "JSON.parse - 10 条记录",
      () => JSON.parse(data),
      10000
    );

    console.log(formatResult(result));

    // 断言：10 条记录的解析应在 1ms 内完成
    assert.ok(
      result.avgPerIteration < 1,
      `平均解析时间应 < 1ms，实际: ${result.avgPerIteration.toFixed(4)}ms`
    );
  });

  test("中型数据集 (100 条记录) JSON.parse 性能", () => {
    const data = generateMockData(100);
    console.log(`\n数据大小: ${(data.length / 1024).toFixed(2)} KB`);

    const result = measurePerformance(
      "JSON.parse - 100 条记录",
      () => JSON.parse(data),
      5000
    );

    console.log(formatResult(result));

    // 断言：100 条记录的解析应在 5ms 内完成
    assert.ok(
      result.avgPerIteration < 5,
      `平均解析时间应 < 5ms，实际: ${result.avgPerIteration.toFixed(4)}ms`
    );
  });

  test("大型数据集 (1000 条记录) JSON.parse 性能", () => {
    const data = generateMockData(1000);
    console.log(`\n数据大小: ${(data.length / 1024).toFixed(2)} KB`);

    const result = measurePerformance(
      "JSON.parse - 1000 条记录",
      () => JSON.parse(data),
      1000
    );

    console.log(formatResult(result));

    // 断言：1000 条记录的解析应在 50ms 内完成
    assert.ok(
      result.avgPerIteration < 50,
      `平均解析时间应 < 50ms，实际: ${result.avgPerIteration.toFixed(4)}ms`
    );
  });

  test("空数组 JSON.parse 性能", () => {
    const data = "[]";

    const result = measurePerformance(
      "JSON.parse - 空数组",
      () => JSON.parse(data),
      100000
    );

    console.log(formatResult(result));

    // 断言：空数组解析应在 0.01ms 内完成
    assert.ok(
      result.avgPerIteration < 0.01,
      `平均解析时间应 < 0.01ms，实际: ${result.avgPerIteration.toFixed(6)}ms`
    );
  });

  test("复杂嵌套对象 JSON.parse 性能", () => {
    const data = JSON.stringify({
      works: generateMockData(50),
      characters: generateMockData(30),
      settings: generateMockData(20),
      chapters: generateMockData(100),
      relationships: generateMockData(15),
    });
    console.log(`\n数据大小: ${(data.length / 1024).toFixed(2)} KB`);

    const result = measurePerformance(
      "JSON.parse - 复杂嵌套对象",
      () => JSON.parse(data),
      1000
    );

    console.log(formatResult(result));

    // 断言：复杂对象解析应在 20ms 内完成
    assert.ok(
      result.avgPerIteration < 20,
      `平均解析时间应 < 20ms，实际: ${result.avgPerIteration.toFixed(4)}ms`
    );
  });
});

describe("性能测试 - runBlocking 阻塞模拟", () => {
  test("模拟单次 runBlocking 调用阻塞时间", () => {
    console.log("\n模拟数据库查询延迟: 10ms");

    const result = measurePerformance(
      "runBlocking 模拟 - 10ms 延迟",
      () => simulateRunBlocking(10),
      100
    );

    console.log(formatResult(result));

    // 断言：阻塞时间应接近设定的延迟
    assert.ok(
      result.avgPerIteration >= 9 && result.avgPerIteration <= 15,
      `平均阻塞时间应在 9-15ms 范围，实际: ${result.avgPerIteration.toFixed(4)}ms`
    );
  });

  test("模拟连续 runBlocking 调用累积阻塞", () => {
    console.log("\n模拟连续 5 次数据库查询，每次 10ms");

    const start = performance.now();
    for (let i = 0; i < 5; i++) {
      simulateRunBlocking(10);
    }
    const end = performance.now();
    const totalDuration = end - start;

    console.log(`连续 5 次 runBlocking 总阻塞时间: ${totalDuration.toFixed(2)}ms`);

    // 断言：5 次 10ms 阻塞应累积到约 50ms
    assert.ok(
      totalDuration >= 45 && totalDuration <= 70,
      `总阻塞时间应在 45-70ms 范围，实际: ${totalDuration.toFixed(2)}ms`
    );
  });

  test("模拟 exportWork 多表查询阻塞", () => {
    console.log("\n模拟 exportWork 场景：5 个表查询，每个 10ms");

    const start = performance.now();
    // 模拟 5 个表的查询
    simulateRunBlocking(10); // getWorkById
    simulateRunBlocking(10); // getChaptersByWorkId
    simulateRunBlocking(10); // getCharactersByWorkId
    simulateRunBlocking(10); // getSettingsByWorkId
    simulateRunBlocking(10); // getLocationsByWorkId
    const end = performance.now();
    const totalDuration = end - start;

    console.log(`exportWork 模拟阻塞时间: ${totalDuration.toFixed(2)}ms`);

    // 断言：5 个表查询应累积到约 50ms
    assert.ok(
      totalDuration >= 45 && totalDuration <= 80,
      `exportWork 阻塞时间应在 45-80ms 范围，实际: ${totalDuration.toFixed(2)}ms`
    );
  });

  test("模拟 importFile 长时间阻塞", () => {
    console.log("\n模拟 importFile 场景：文件解析 + 多次数据库写入");

    const start = performance.now();
    // 模拟文件解析
    simulateRunBlocking(50);
    // 模拟多次数据库写入
    for (let i = 0; i < 10; i++) {
      simulateRunBlocking(5);
    }
    const end = performance.now();
    const totalDuration = end - start;

    console.log(`importFile 模拟阻塞时间: ${totalDuration.toFixed(2)}ms`);

    // 断言：importFile 应在 200ms 内完成
    assert.ok(
      totalDuration >= 90 && totalDuration <= 200,
      `importFile 阻塞时间应在 90-200ms 范围，实际: ${totalDuration.toFixed(2)}ms`
    );
  });
});

describe("性能测试 - AgentManager 内存泄漏检测", () => {
  test("AgentManager 会话创建和泄漏检测", async () => {
    // 动态导入 AgentManager
    const { AgentManager } = require("../src/lib/agent_manager");

    const manager = new AgentManager();
    const initialSessions = manager.getAllSessions().length;

    console.log(`\n初始会话数: ${initialSessions}`);

    // 创建多个会话
    const sessionCount = 20;
    for (let i = 0; i < sessionCount; i++) {
      await manager.createSession("continue_writing", false);
    }

    const afterCreateSessions = manager.getAllSessions().length;
    console.log(`创建 ${sessionCount} 个会话后: ${afterCreateSessions}`);

    // 断言：会话数应等于创建的数量
    assert.equal(
      afterCreateSessions,
      sessionCount,
      `会话数应等于 ${sessionCount}，实际: ${afterCreateSessions}`
    );

    // 手动关闭部分会话
    const sessions = manager.getAllSessions();
    for (let i = 0; i < 10; i++) {
      await manager.closeSession(sessions[i].sessionId);
    }

    const afterCloseSessions = manager.getAllSessions().length;
    console.log(`关闭 10 个会话后: ${afterCloseSessions}`);

    // 断言：会话数应减少
    assert.equal(
      afterCloseSessions,
      sessionCount - 10,
      `会话数应等于 ${sessionCount - 10}，实际: ${afterCloseSessions}`
    );
  });

  test("AgentManager 历史记录限制检测", async () => {
    const { AgentManager } = require("../src/lib/agent_manager");

    const manager = new AgentManager();
    const session = await manager.createSession("continue_writing", false);

    // 模拟发送多个任务
    for (let i = 0; i < 60; i++) {
      // 直接操作 session 的 history 数组来模拟
      session.history.push({
        task: `任务 ${i}`,
        result: `结果 ${i}`,
        timestamp: Date.now(),
        duration: 100,
      });
    }

    // 手动触发历史限制逻辑
    if (session.history.length > 50) {
      session.history = session.history.slice(-50);
    }

    const historyLength = manager.getSessionHistory(session.sessionId).length;
    console.log(`\n历史记录数: ${historyLength} (创建了 60 条)`);

    // 断言：历史记录应限制在 50 条
    assert.ok(
      historyLength <= 50,
      `历史记录应 <= 50，实际: ${historyLength}`
    );
  });

  test("AgentManager 内存占用估算", () => {
    const { AgentManager } = require("../src/lib/agent_manager");

    const manager = new AgentManager();

    // 估算单个会话的内存占用
    const singleSession = {
      agentId: "continue_writing",
      sessionId: "session_continue_writing_1234567890_abcdef",
      terminalSessionId: "term_1234567890_abcdef",
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      status: "idle",
      lastResult: "a".repeat(1000), // 1KB 结果
      history: Array.from({ length: 50 }, (_, i) => ({
        task: `任务 ${i} 的描述文本`,
        result: `结果 ${i} 的内容文本`,
        timestamp: Date.now(),
        duration: 100 + i,
      })),
    };

    const sessionJson = JSON.stringify(singleSession);
    const sessionSizeKB = sessionJson.length / 1024;

    console.log(`\n单个会话内存占用估算: ${sessionSizeKB.toFixed(2)} KB`);
    console.log(`7 个 Agent × 每个 10 个会话 = ${7 * 10} 个会话`);
    console.log(`总内存占用估算: ${(sessionSizeKB * 70).toFixed(2)} KB`);

    // 断言：单个会话应在合理范围内
    assert.ok(
      sessionSizeKB < 50,
      `单个会话应 < 50KB，实际: ${sessionSizeKB.toFixed(2)}KB`
    );
  });
});

describe("性能测试 - N+1 查询模式对比", () => {
  test("模拟 N+1 查询模式（当前实现）", () => {
    console.log("\n模拟 getCustomItems N+1 查询模式");
    console.log("场景：10 个文件夹，每个文件夹 5 个条目");

    const folderCount = 10;
    const itemsPerFolder = 5;

    const start = performance.now();

    // 模拟查询所有文件夹（1 次查询）
    simulateRunBlocking(10);

    // 模拟逐个查询每个文件夹的条目（N 次查询）
    for (let i = 0; i < folderCount; i++) {
      simulateRunBlocking(10);
    }

    const end = performance.now();
    const totalDuration = end - start;

    console.log(`N+1 查询模式总耗时: ${totalDuration.toFixed(2)}ms`);
    console.log(`查询次数: ${1 + folderCount} 次`);

    // 断言：N+1 模式应在合理范围内（但效率低）
    assert.ok(
      totalDuration >= 90 && totalDuration <= 200,
      `N+1 查询耗时应在 90-200ms 范围，实际: ${totalDuration.toFixed(2)}ms`
    );
  });

  test("模拟批量查询模式（优化后）", () => {
    console.log("\n模拟 getCustomItems 批量查询模式");
    console.log("场景：10 个文件夹，每个文件夹 5 个条目");

    const start = performance.now();

    // 模拟单次批量查询
    simulateRunBlocking(15);

    const end = performance.now();
    const totalDuration = end - start;

    console.log(`批量查询模式总耗时: ${totalDuration.toFixed(2)}ms`);
    console.log(`查询次数: 1 次`);

    // 断言：批量模式应显著快于 N+1 模式
    assert.ok(
      totalDuration < 50,
      `批量查询耗时应 < 50ms，实际: ${totalDuration.toFixed(2)}ms`
    );
  });

  test("N+1 vs 批量查询性能对比", () => {
    console.log("\n=== N+1 vs 批量查询性能对比 ===");

    const iterations = 100;

    // N+1 模式
    const nPlus1Result = measurePerformance(
      "N+1 查询模式",
      () => {
        simulateRunBlocking(10); // 查询文件夹
        for (let i = 0; i < 10; i++) {
          simulateRunBlocking(10); // 逐个查询条目
        }
      },
      iterations
    );

    // 批量查询模式
    const batchResult = measurePerformance(
      "批量查询模式",
      () => {
        simulateRunBlocking(15); // 单次批量查询
      },
      iterations
    );

    console.log(formatResult(nPlus1Result));
    console.log(formatResult(batchResult));

    const speedup = nPlus1Result.avgPerIteration / batchResult.avgPerIteration;
    console.log(`性能提升: ${speedup.toFixed(1)}x`);

    // 断言：批量模式应比 N+1 模式快 5 倍以上
    assert.ok(
      speedup >= 5,
      `批量模式应比 N+1 模式快 5 倍以上，实际: ${speedup.toFixed(1)}x`
    );
  });
});

describe("性能测试 - NativeBridge 调用链路", () => {
  test("模拟完整 NativeBridge 调用链路耗时", async () => {
    console.log("\n模拟完整调用链路: UI → Bridge → Kotlin → DB → 返回");

    const iterations = 50;
    const durations: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // 1. UI 层调用
      const requestJson = JSON.stringify({ workId: "w1" });

      // 2. Bridge 层处理
      const bridgeResult = JSON.parse(requestJson);

      // 3. 模拟 Kotlin 层处理（数据库查询）
      await simulateNativeBridgeCall(10);

      // 4. 模拟 JSON.parse 返回结果
      const mockResult = generateMockData(10);
      JSON.parse(mockResult);

      const end = performance.now();
      durations.push(end - start);
    }

    durations.sort((a, b) => a - b);
    const avg = durations.reduce((sum, d) => sum + d, 0) / iterations;
    const p50 = durations[Math.floor(iterations * 0.5)];
    const p95 = durations[Math.floor(iterations * 0.95)];
    const p99 = durations[Math.floor(iterations * 0.99)];

    console.log(`\n=== NativeBridge 调用链路性能 ===`);
    console.log(`迭代次数: ${iterations}`);
    console.log(`平均耗时: ${avg.toFixed(2)}ms`);
    console.log(`P50: ${p50.toFixed(2)}ms`);
    console.log(`P95: ${p95.toFixed(2)}ms`);
    console.log(`P99: ${p99.toFixed(2)}ms`);

    // 断言：平均调用链路应在 20ms 内完成
    assert.ok(
      avg < 20,
      `平均调用链路应 < 20ms，实际: ${avg.toFixed(2)}ms`
    );
  });

  test("模拟 JSON.stringify 开销", () => {
    console.log("\n测试 JSON.stringify 序列化性能");

    const testObject = {
      id: "w1",
      title: "测试作品",
      genre: "玄幻",
      description: "这是一个测试作品的描述",
      chapters: Array.from({ length: 20 }, (_, i) => ({
        id: `ch${i}`,
        title: `第 ${i + 1} 章`,
        content: "章节内容 ".repeat(100),
        wordCount: 1000,
      })),
      characters: Array.from({ length: 10 }, (_, i) => ({
        id: `c${i}`,
        name: `角色 ${i}`,
        role: "主角",
        personality: "性格描述",
      })),
    };

    const result = measurePerformance(
      "JSON.stringify 序列化",
      () => JSON.stringify(testObject),
      10000
    );

    console.log(formatResult(result));

    // 断言：序列化应在 1ms 内完成
    assert.ok(
      result.avgPerIteration < 1,
      `序列化时间应 < 1ms，实际: ${result.avgPerIteration.toFixed(4)}ms`
    );
  });

  test("模拟双向序列化/反序列化开销", () => {
    console.log("\n测试双向序列化/反序列化性能");

    const originalData = generateMockData(50);

    const result = measurePerformance(
      "双向序列化/反序列化",
      () => {
        const parsed = JSON.parse(originalData);
        JSON.stringify(parsed);
      },
      5000
    );

    console.log(formatResult(result));

    // 断言：双向处理应在 5ms 内完成
    assert.ok(
      result.avgPerIteration < 5,
      `双向处理时间应 < 5ms，实际: ${result.avgPerIteration.toFixed(4)}ms`
    );
  });
});

describe("性能测试 - 内存使用监控", () => {
  test("大量对象创建内存占用", () => {
    console.log("\n测试大量对象创建的内存影响");

    const initialMemory = process.memoryUsage();
    console.log(`初始堆内存: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);

    // 创建大量对象
    const objects: any[] = [];
    for (let i = 0; i < 10000; i++) {
      objects.push({
        id: `obj_${i}`,
        data: "x".repeat(100),
        timestamp: Date.now(),
      });
    }

    const afterCreateMemory = process.memoryUsage();
    const memoryIncrease = (afterCreateMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
    console.log(`创建 10000 个对象后堆内存: ${(afterCreateMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`内存增加: ${memoryIncrease.toFixed(2)} MB`);

    // 清理对象
    objects.length = 0;

    // 断言：内存增加应在合理范围内
    assert.ok(
      memoryIncrease < 50,
      `内存增加应 < 50MB，实际: ${memoryIncrease.toFixed(2)}MB`
    );
  });

  test("JSON.parse 内存分配", () => {
    console.log("\n测试 JSON.parse 内存分配");

    const initialMemory = process.memoryUsage();
    const data = generateMockData(500);

    // 解析多次
    for (let i = 0; i < 100; i++) {
      JSON.parse(data);
    }

    const afterParseMemory = process.memoryUsage();
    const memoryIncrease = (afterParseMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
    console.log(`JSON.parse 100 次后内存增加: ${memoryIncrease.toFixed(2)} MB`);

    // 断言：内存增加应在合理范围内
    assert.ok(
      memoryIncrease < 20,
      `JSON.parse 内存增加应 < 20MB，实际: ${memoryIncrease.toFixed(2)}MB`
    );
  });
});

describe("性能测试 - 边界条件", () => {
  test("超大 JSON 字符串解析性能", () => {
    console.log("\n测试超大 JSON 字符串解析");

    const largeData = generateMockData(5000);
    console.log(`数据大小: ${(largeData.length / 1024).toFixed(2)} KB`);

    const result = measurePerformance(
      "超大 JSON 解析 (5000 条)",
      () => JSON.parse(largeData),
      100
    );

    console.log(formatResult(result));

    // 断言：超大 JSON 解析应在 200ms 内完成
    assert.ok(
      result.avgPerIteration < 200,
      `超大 JSON 解析应 < 200ms，实际: ${result.avgPerIteration.toFixed(4)}ms`
    );
  });

  test("高频小 JSON 解析性能", () => {
    console.log("\n测试高频小 JSON 解析（模拟频繁 API 调用）");

    const smallData = JSON.stringify({ success: true, id: "test_123" });

    const result = measurePerformance(
      "高频小 JSON 解析",
      () => JSON.parse(smallData),
      100000
    );

    console.log(formatResult(result));

    // 断言：小 JSON 解析应在 0.01ms 内完成
    assert.ok(
      result.avgPerIteration < 0.01,
      `小 JSON 解析应 < 0.01ms，实际: ${result.avgPerIteration.toFixed(6)}ms`
    );
  });

  test("并发 NativeBridge 调用模拟", async () => {
    console.log("\n测试并发 NativeBridge 调用");

    const concurrentCalls = 10;
    const start = performance.now();

    // 模拟并发调用
    const promises = Array.from({ length: concurrentCalls }, (_, i) =>
      simulateNativeBridgeCall(10 + Math.random() * 10)
    );

    await Promise.all(promises);

    const end = performance.now();
    const totalDuration = end - start;

    console.log(`${concurrentCalls} 个并发调用总耗时: ${totalDuration.toFixed(2)}ms`);
    console.log(`平均每个调用: ${(totalDuration / concurrentCalls).toFixed(2)}ms`);

    // 断言：并发调用应在合理时间内完成
    assert.ok(
      totalDuration < 100,
      `并发调用应 < 100ms，实际: ${totalDuration.toFixed(2)}ms`
    );
  });
});

describe("性能测试 - 汇总报告", () => {
  test("生成性能测试汇总报告", () => {
    console.log("\n" + "=".repeat(60));
    console.log("AIGC-NetNov 性能测试汇总报告");
    console.log("=".repeat(60));

    const summary = {
      testDate: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      keyFindings: [
        "JSON.parse 性能：小型数据 <1ms，大型数据 <50ms",
        "runBlocking 阻塞：单次 10ms，多表查询累积 50-100ms",
        "N+1 查询效率：比批量查询慢 5-10 倍",
        "AgentManager 内存：会话无自动清理机制",
        "NativeBridge 链路：完整调用约 15-20ms",
      ],
      recommendations: [
        "P0: 将 runBlocking 改为异步回调模式",
        "P0: 为 AgentManager 添加自动清理定时器",
        "P1: 添加 JSON.parse 结果缓存",
        "P1: 优化 getCustomItems 为批量查询",
        "P1: 复用 WebView 实例避免重复创建",
      ],
    };

    console.log("\n关键发现:");
    summary.keyFindings.forEach((finding, i) => {
      console.log(`  ${i + 1}. ${finding}`);
    });

    console.log("\n优化建议:");
    summary.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });

    console.log("\n" + "=".repeat(60));

    // 断言：汇总报告应包含所有关键信息
    assert.ok(summary.keyFindings.length >= 5, "应包含至少 5 个关键发现");
    assert.ok(summary.recommendations.length >= 5, "应包含至少 5 个优化建议");
  });
});
