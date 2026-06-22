// AI 写作工具

import { Logger, requireString } from "./novel_utils";

export function registerTools() {
  // AI 续写
  Tools.register("novelide:continue_writing", {
    description: "AI 续写，根据前文内容自动续写后续情节",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "前文内容" },
        workId: { type: "string", description: "作品ID" }
      },
      required: ["content"]
    },
    execute: async (params: any) => {
      const content = requireString(params.content, "content");
      try {
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `请续写以下内容：\n${content}` }],
          systemPrompt: "你是一个网文写作助手，请根据前文内容续写，保持风格一致，情节连贯，续写约500字。"
        });
        if (!result) {
          throw new Error("AI 续写返回了空结果");
        }
        Logger.info("AI 续写完成");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI 续写失败", error);
        return { success: false, error: (error as Error).message || "AI 续写失败" };
      }
    }
  });

  // 文本精修
  Tools.register("novelide:polish_text", {
    description: "AI 文本精修，优化语句表达、润色文笔",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "需要精修的文本内容" },
        workId: { type: "string", description: "作品ID" }
      },
      required: ["content"]
    },
    execute: async (params: any) => {
      const content = requireString(params.content, "content");
      try {
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `请精修以下文本，优化语句表达，提升文笔质量，保持原意不变：\n${content}` }],
          systemPrompt: "你是一个专业的文学编辑，请对文本进行精修润色，优化措辞、节奏和表达力，保持原文的核心意思和风格。"
        });
        if (!result) {
          throw new Error("AI 精修返回了空结果");
        }
        Logger.info("AI 精修完成");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI 精修失败", error);
        return { success: false, error: (error as Error).message || "AI 精修失败" };
      }
    }
  });

  // 扩写
  Tools.register("novelide:expand_text", {
    description: "AI 扩写，将简短内容扩展为更详细的描写",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "需要扩写的文本内容" },
        workId: { type: "string", description: "作品ID" }
      },
      required: ["content"]
    },
    execute: async (params: any) => {
      const content = requireString(params.content, "content");
      try {
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `请将以下内容进行扩写，增加细节描写、心理活动、环境渲染，使内容更加丰富饱满：\n${content}` }],
          systemPrompt: "你是一个网文写作助手，请对文本进行扩写，添加生动的细节描写、人物心理、环境氛围等，使内容更加丰满有层次。"
        });
        if (!result) {
          throw new Error("AI 扩写返回了空结果");
        }
        Logger.info("AI 扩写完成");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI 扩写失败", error);
        return { success: false, error: (error as Error).message || "AI 扩写失败" };
      }
    }
  });

  // 去 AI 味
  Tools.register("novelide:deai_flavor", {
    description: "去除 AI 痕迹，让文本更自然、更有人味",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "需要去 AI 味的文本内容" },
        workId: { type: "string", description: "作品ID" }
      },
      required: ["content"]
    },
    execute: async (params: any) => {
      const content = requireString(params.content, "content");
      try {
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `请改写以下文本，去除AI生成的痕迹，让语言更自然、更口语化、更有人味：\n${content}` }],
          systemPrompt: "你是一个资深网文作者，请改写文本使其读起来像真人写的，避免AI常见的套路化表达、过度修饰和生硬转折，使用更自然的口语化表达。"
        });
        if (!result) {
          throw new Error("AI 去味返回了空结果");
        }
        Logger.info("AI 去味完成");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI 去味失败", error);
        return { success: false, error: (error as Error).message || "AI 去味失败" };
      }
    }
  });

  // 爽点检查
  Tools.register("novelide:check_pleasure", {
    description: "检查文本中的爽点设计，分析节奏和读者体验",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "需要检查的文本内容" },
        workId: { type: "string", description: "作品ID" }
      },
      required: ["content"]
    },
    execute: async (params: any) => {
      const content = requireString(params.content, "content");
      try {
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `请分析以下网文内容的爽点设计，包括：\n1. 是否有明显的爽点和高潮\n2. 节奏是否合理\n3. 读者的情绪引导是否到位\n4. 改进建议\n\n内容：\n${content}` }],
          systemPrompt: "你是一个网文编辑专家，擅长分析网文的爽点设计、节奏把控和读者体验。请从专业角度给出分析和改进建议。"
        });
        if (!result) {
          throw new Error("AI 爽点检查返回了空结果");
        }
        Logger.info("AI 爽点检查完成");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI 爽点检查失败", error);
        return { success: false, error: (error as Error).message || "AI 爽点检查失败" };
      }
    }
  });

  // 水文检测
  Tools.register("novelide:detect_water", {
    description: "检测文本中的水文内容，识别冗余和无效描写",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "需要检测的文本内容" },
        workId: { type: "string", description: "作品ID" }
      },
      required: ["content"]
    },
    execute: async (params: any) => {
      const content = requireString(params.content, "content");
      try {
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `请检测以下文本中的水文内容，标记出：\n1. 冗余重复的描写\n2. 无效的过渡段落\n3. 与主线无关的废话\n4. 注水嫌疑的段落\n5. 整体水文比例评估\n\n内容：\n${content}` }],
          systemPrompt: "你是一个严格的网文质检编辑，擅长识别水文、注水内容。请逐段分析，标记出冗余和无效内容，并给出精简建议。"
        });
        if (!result) {
          throw new Error("AI 水文检测返回了空结果");
        }
        Logger.info("AI 水文检测完成");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI 水文检测失败", error);
        return { success: false, error: (error as Error).message || "AI 水文检测失败" };
      }
    }
  });

  // 爆款标题
  Tools.register("novelide:generate_title", {
    description: "AI 生成爆款标题，根据内容生成吸引读者的标题",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "章节或作品的内容摘要" },
        genre: { type: "string", description: "作品类型（如：都市、玄幻、悬疑）" },
        workId: { type: "string", description: "作品ID" }
      },
      required: ["content"]
    },
    execute: async (params: any) => {
      const content = requireString(params.content, "content");
      const { genre = "" } = params;
      try {
        const genreHint = genre ? `，作品类型为「${genre}」` : "";
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `请根据以下内容生成5个爆款标题${genreHint}，要求吸引眼球、引发好奇心、适合网文平台：\n${content}` }],
          systemPrompt: "你是一个网文标题策划专家，擅长创作吸引读者点击的爆款标题。请生成有冲击力、悬念感和吸引力的标题。"
        });
        if (!result) {
          throw new Error("AI 标题生成返回了空结果");
        }
        Logger.info("AI 标题生成完成");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI 标题生成失败", error);
        return { success: false, error: (error as Error).message || "AI 标题生成失败" };
      }
    }
  });
}
