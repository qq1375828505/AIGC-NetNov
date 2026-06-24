"use strict";
// 写作统计工具
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTools = registerTools;
function registerTools() {
    // 获取写作统计
    Tools.register("novelide:get_writing_stats", {
        description: "获取写作统计（总字数、今日字数、连续天数、目标完成度）",
        parameters: {
            type: "object",
            properties: {
                workId: { type: "string", description: "作品ID" }
            }
        },
        execute: async (params) => {
            const { workId } = params;
            const result = await Tools.callNative("getWritingStats", [workId || ""]);
            return { success: true, stats: JSON.parse(result) };
        }
    });
    // 获取章节统计
    Tools.register("novelide:get_chapter_stats", {
        description: "获取指定作品的章节统计信息",
        parameters: {
            type: "object",
            properties: {
                workId: { type: "string", description: "作品ID" }
            },
            required: ["workId"]
        },
        execute: async (params) => {
            const { workId } = params;
            const result = await Tools.callNative("getChapterStats", [workId]);
            return { success: true, stats: JSON.parse(result) };
        }
    });
    // 获取每日统计
    Tools.register("novelide:get_daily_stats", {
        description: "获取每日写作统计数据",
        parameters: {
            type: "object",
            properties: {
                workId: { type: "string", description: "作品ID" },
                days: { type: "number", description: "查询天数（默认30天）" }
            }
        },
        execute: async (params) => {
            const { workId = "", days = 30 } = params;
            const result = await Tools.callNative("getDailyStats", [workId, days]);
            return { success: true, stats: JSON.parse(result) };
        }
    });
}
