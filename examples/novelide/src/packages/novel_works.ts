// 作品管理工具

import { Logger, safeNativeCall, safeNativeJsonCall, safeNativeBoolCall, requireString, clearJsonCache } from "./novel_utils";

export function registerTools() {
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
    execute: async (params: any) => {
      const title = requireString(params.title, "title");
      const { genre = "", description = "" } = params;
      try {
        const result = await safeNativeCall<string>("createWork", [title, genre, description]);
        clearJsonCache(); // 清除缓存
        Logger.info(`创建作品成功: ${result}`);
        return { success: true, workId: result };
      } catch (error) {
        Logger.error("创建作品失败", error);
        return { success: false, error: (error as Error).message || "创建作品失败" };
      }
    }
  });

  // 获取作品列表（带缓存）
  Tools.register("novelide:list_works", {
    description: "获取所有小说作品列表",
    parameters: { type: "object", properties: {} },
    execute: async () => {
      try {
        const works = await safeNativeJsonCall<any[]>("getNovelWorks", [], true);
        return { success: true, works };
      } catch (error) {
        Logger.error("获取作品列表失败", error);
        return { success: false, error: (error as Error).message || "获取作品列表失败", works: [] };
      }
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
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      try {
        const { workId: _, ...updates } = params;
        const result = await safeNativeBoolCall("updateWork", [JSON.stringify({ id: workId, ...updates })]);
        clearJsonCache(); // 清除缓存
        Logger.info(`更新作品成功: ${workId}`);
        return { success: true };
      } catch (error) {
        Logger.error("更新作品失败", error);
        return { success: false, error: (error as Error).message || "更新作品失败" };
      }
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
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      try {
        const result = await safeNativeBoolCall("deleteWork", [workId]);
        clearJsonCache(); // 清除缓存
        Logger.info(`删除作品成功: ${workId}`);
        return { success: true };
      } catch (error) {
        Logger.error("删除作品失败", error);
        return { success: false, error: (error as Error).message || "删除作品失败" };
      }
    }
  });
}
