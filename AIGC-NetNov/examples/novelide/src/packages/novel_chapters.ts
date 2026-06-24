// 章节管理工具

import { Logger, safeNativeCall, safeNativeJsonCall, safeNativeBoolCall, requireString, clearJsonCache } from "./novel_utils";

export function registerTools() {
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
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      const title = requireString(params.title, "title");
      const { order = 0 } = params;
      try {
        const result = await safeNativeCall<string>("createChapter", [workId, title, order]);
        Logger.info(`创建章节成功: ${result}`);
        return { success: true, chapterId: result };
      } catch (error) {
        Logger.error("创建章节失败", error);
        return { success: false, error: (error as Error).message || "创建章节失败" };
      }
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
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      try {
        const chapters = await safeNativeJsonCall<any[]>("getChapters", [workId]);
        return { success: true, chapters };
      } catch (error) {
        Logger.error("获取章节列表失败", error);
        return { success: false, error: (error as Error).message || "获取章节列表失败", chapters: [] };
      }
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
    execute: async (params: any) => {
      const chapterId = requireString(params.chapterId, "chapterId");
      try {
        const result = await safeNativeCall<string>("getChapterContent", [chapterId]);
        return { success: true, content: result };
      } catch (error) {
        Logger.error("获取章节内容失败", error);
        return { success: false, error: (error as Error).message || "获取章节内容失败" };
      }
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
    execute: async (params: any) => {
      const chapterId = requireString(params.chapterId, "chapterId");
      const { content = "", wordCount = 0 } = params;
      try {
        const result = await safeNativeBoolCall("saveChapterContent", [chapterId, content, wordCount]);
        Logger.info(`保存章节成功: ${chapterId}`);
        return { success: true };
      } catch (error) {
        Logger.error("保存章节失败", error);
        return { success: false, error: (error as Error).message || "保存章节失败" };
      }
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
    execute: async (params: any) => {
      const chapterId = requireString(params.chapterId, "chapterId");
      try {
        const result = await safeNativeBoolCall("deleteChapter", [chapterId]);
        Logger.info(`删除章节成功: ${chapterId}`);
        return { success: true };
      } catch (error) {
        Logger.error("删除章节失败", error);
        return { success: false, error: (error as Error).message || "删除章节失败" };
      }
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
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      const { chapterIds } = params;
      if (!Array.isArray(chapterIds) || chapterIds.length === 0) {
        return { success: false, error: "章节ID列表不能为空" };
      }
      try {
        const result = await safeNativeBoolCall("reorderChapters", [workId, JSON.stringify(chapterIds)]);
        Logger.info(`章节排序成功: ${workId}`);
        return { success: true };
      } catch (error) {
        Logger.error("章节排序失败", error);
        return { success: false, error: (error as Error).message || "章节排序失败" };
      }
    }
  });
}
