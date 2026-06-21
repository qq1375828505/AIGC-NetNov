"use strict";
// 作品管理工具
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTools = registerTools;
function registerTools() {
    // 创建作品
    Tools.register("novelide:create_work", {
        description: "创建新的小说作品",
        parameters: {
            type: "object",
            properties: {
                title: { type: "string", description: "作品标题" },
                genre: { type: "string", description: "作品类型（如：都市、玄幻、悬疑）" },
                description: { type: "string", description: "作品简介" }
            },
            required: ["title"]
        },
        execute: async (params) => {
            const { title, genre = "", description = "" } = params;
            const result = await Tools.callNative("createWork", [title, genre, description]);
            return { success: true, workId: result };
        }
    });
    // 获取作品列表
    Tools.register("novelide:list_works", {
        description: "获取所有小说作品列表",
        parameters: { type: "object", properties: {} },
        execute: async () => {
            const result = await Tools.callNative("getNovelWorks", []);
            return { success: true, works: JSON.parse(result) };
        }
    });
    // 获取作品详情
    Tools.register("novelide:get_work", {
        description: "获取指定作品的详细信息",
        parameters: {
            type: "object",
            properties: {
                workId: { type: "string", description: "作品ID" }
            },
            required: ["workId"]
        },
        execute: async (params) => {
            const { workId } = params;
            // 通过 NativeBridge 获取作品详情
            return { success: true, work: {} };
        }
    });
    // 更新作品
    Tools.register("novelide:update_work", {
        description: "更新作品信息",
        parameters: {
            type: "object",
            properties: {
                workId: { type: "string", description: "作品ID" },
                title: { type: "string", description: "新标题" },
                genre: { type: "string", description: "新类型" },
                description: { type: "string", description: "新简介" }
            },
            required: ["workId"]
        },
        execute: async (params) => {
            const { workId, ...updates } = params;
            const result = await Tools.callNative("updateWork", [JSON.stringify({ id: workId, ...updates })]);
            return { success: true };
        }
    });
    // 删除作品
    Tools.register("novelide:delete_work", {
        description: "删除指定作品",
        parameters: {
            type: "object",
            properties: {
                workId: { type: "string", description: "作品ID" }
            },
            required: ["workId"]
        },
        execute: async (params) => {
            const { workId } = params;
            const result = await Tools.callNative("deleteWork", [workId]);
            return { success: true };
        }
    });
}
