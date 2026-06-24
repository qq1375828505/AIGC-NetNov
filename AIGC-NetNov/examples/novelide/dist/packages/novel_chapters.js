"use strict";
// 章节管理工具
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTools = registerTools;
function registerTools() {
    // 创建章节
    Tools.register("novelide:create_chapter", {
        description: "为指定作品创建新章节",
        parameters: {
            type: "object",
            properties: {
                workId: { type: "string", description: "作品ID" },
                title: { type: "string", description: "章节标题" },
                order: { type: "number", description: "章节排序（可选）" }
            },
            required: ["workId", "title"]
        },
        execute: async (params) => {
            const { workId, title, order = 0 } = params;
            const result = await Tools.callNative("createChapter", [workId, title, order]);
            return { success: true, chapterId: result };
        }
    });
    // 获取章节列表
    Tools.register("novelide:list_chapters", {
        description: "获取指定作品的所有章节",
        parameters: {
            type: "object",
            properties: {
                workId: { type: "string", description: "作品ID" }
            },
            required: ["workId"]
        },
        execute: async (params) => {
            const { workId } = params;
            const result = await Tools.callNative("getChapters", [workId]);
            return { success: true, chapters: JSON.parse(result) };
        }
    });
    // 获取章节内容
    Tools.register("novelide:get_chapter", {
        description: "获取指定章节的内容",
        parameters: {
            type: "object",
            properties: {
                chapterId: { type: "string", description: "章节ID" }
            },
            required: ["chapterId"]
        },
        execute: async (params) => {
            const { chapterId } = params;
            const result = await Tools.callNative("getChapterContent", [chapterId]);
            return { success: true, content: result };
        }
    });
    // 保存章节内容
    Tools.register("novelide:save_chapter", {
        description: "保存章节内容",
        parameters: {
            type: "object",
            properties: {
                chapterId: { type: "string", description: "章节ID" },
                content: { type: "string", description: "章节内容" },
                wordCount: { type: "number", description: "字数" }
            },
            required: ["chapterId", "content"]
        },
        execute: async (params) => {
            const { chapterId, content, wordCount = 0 } = params;
            const result = await Tools.callNative("saveChapterContent", [chapterId, content, wordCount]);
            return { success: true };
        }
    });
    // 删除章节
    Tools.register("novelide:delete_chapter", {
        description: "删除指定章节",
        parameters: {
            type: "object",
            properties: {
                chapterId: { type: "string", description: "章节ID" }
            },
            required: ["chapterId"]
        },
        execute: async (params) => {
            const { chapterId } = params;
            const result = await Tools.callNative("deleteChapter", [chapterId]);
            return { success: true };
        }
    });
    // 章节排序
    Tools.register("novelide:reorder_chapters", {
        description: "重新排序章节",
        parameters: {
            type: "object",
            properties: {
                workId: { type: "string", description: "作品ID" },
                chapterIds: { type: "array", items: { type: "string" }, description: "章节ID列表（按新顺序）" }
            },
            required: ["workId", "chapterIds"]
        },
        execute: async (params) => {
            const { workId, chapterIds } = params;
            const result = await Tools.callNative("reorderChapters", [workId, JSON.stringify(chapterIds)]);
            return { success: true };
        }
    });
}
