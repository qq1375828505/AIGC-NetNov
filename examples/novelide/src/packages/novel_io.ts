// 导入导出工具

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
      const { uri, fileName, workId } = params;
      const result = JSON.parse((window as any).NativeBridge.importFile(uri, fileName, workId || ""));
      return { success: true, result };
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
      const { workId } = params;
      const result = JSON.parse((window as any).NativeBridge.exportWorkTxt(workId));
      return { success: true, result };
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
      const { workId } = params;
      const result = JSON.parse((window as any).NativeBridge.exportWorkMd(workId));
      return { success: true, result };
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
      const { workId } = params;
      const result = JSON.parse((window as any).NativeBridge.exportWorkJson(workId));
      return { success: true, result };
    }
  });
}
