// 导入导出工具

import { Logger, safeNativeJsonCall, requireString } from "./novel_utils";

export function registerTools() {
  // 通用导入（支持 TXT/Markdown/JSON）
  Tools.register("novelide:import_file", {
    description: "导入文件（支持 TXT/Markdown/JSON 格式）",
    parameters: {
      type: "object",
      properties: {
        uri: { type: "string", description: "文件URI" },
        fileName: { type: "string", description: "文件名" },
        workId: { type: "string", description: "目标作品ID（可选）" }
      },
      required: ["uri", "fileName"]
    },
    execute: async (params: any) => {
      const uri = requireString(params.uri, "uri");
      const fileName = requireString(params.fileName, "fileName");
      const { workId = "" } = params;
      try {
        const result = await safeNativeJsonCall<any>("importFile", [uri, fileName, workId]);
        Logger.info(`导入文件成功: ${fileName}`);
        return { success: true, result };
      } catch (error) {
        Logger.error("导入文件失败", error);
        return { success: false, error: (error as Error).message || "导入文件失败" };
      }
    }
  });

  // 导出为 TXT
  Tools.register("novelide:export_work_txt", {
    description: "将作品导出为 TXT 格式",
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
        const result = await safeNativeJsonCall<any>("exportWorkTxt", [workId]);
        Logger.info(`导出 TXT 成功: ${workId}`);
        return { success: true, result };
      } catch (error) {
        Logger.error("导出 TXT 失败", error);
        return { success: false, error: (error as Error).message || "导出 TXT 失败" };
      }
    }
  });

  // 导出为 Markdown
  Tools.register("novelide:export_work_md", {
    description: "将作品导出为 Markdown 格式",
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
        const result = await safeNativeJsonCall<any>("exportWorkMd", [workId]);
        Logger.info(`导出 Markdown 成功: ${workId}`);
        return { success: true, result };
      } catch (error) {
        Logger.error("导出 Markdown 失败", error);
        return { success: false, error: (error as Error).message || "导出 Markdown 失败" };
      }
    }
  });

  // 导出为 JSON
  Tools.register("novelide:export_work_json", {
    description: "将作品导出为 JSON 格式",
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
        const result = await safeNativeJsonCall<any>("exportWorkJson", [workId]);
        Logger.info(`导出 JSON 成功: ${workId}`);
        return { success: true, result };
      } catch (error) {
        Logger.error("导出 JSON 失败", error);
        return { success: false, error: (error as Error).message || "导出 JSON 失败" };
      }
    }
  });
}
