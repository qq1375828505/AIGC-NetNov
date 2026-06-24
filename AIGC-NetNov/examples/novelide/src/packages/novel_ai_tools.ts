// AI 写作工具 - 支持流式响应

import { Logger, requireString } from "./novel_utils";

/** 构建带系统指令的完整消息 */
function buildMessage(systemPrompt: string, userContent: string): string {
  return `[系统指令] ${systemPrompt}\n\n[用户请求] ${userContent}`;
}

/** 非流式 AI 调用 */
async function callAi(systemPrompt: string, content: string): Promise<string> {
  const fullMessage = buildMessage(systemPrompt, content);
  const result = await Tools.Chat.sendMessage(fullMessage);
  if (!result) {
    throw new Error("AI 调用失败：sendMessage 返回 undefined");
  }
  const aiReply = (result.aiResponse ?? "").trim();
  if (!aiReply) {
    throw new Error("AI 返回了空回复");
  }
  return aiReply;
}

/** 流式 AI 调用，返回最终文本并实时推送中间结果 */
async function callAiStreaming(
  systemPrompt: string,
  content: string,
  onChunk?: (chunk: string, accumulated: string) => void
): Promise<string> {
  const fullMessage = buildMessage(systemPrompt, content);
  let accumulated = "";

  const result = await Tools.Chat.sendMessageStreaming(fullMessage, undefined, undefined, undefined, {
    onIntermediateResult: (event) => {
      if (event.type === "chunk" && event.chunk) {
        accumulated += event.chunk;
        onChunk?.(event.chunk, accumulated);
      }
    },
  });

  if (!result) {
    throw new Error("AI 调用失败：sendMessageStreaming 返回 undefined");
  }

  const aiReply = (result.aiResponse ?? accumulated).trim();
  if (!aiReply) {
    throw new Error("AI 返回了空回复");
  }
  return aiReply;
}

/** 流式结果容器 - 通过 sendIntermediateResult 推送增量 */
interface StreamToolResult {
  success: boolean;
  text?: string;
  streaming?: boolean;
  chunk?: string;
  accumulated?: string;
  done?: boolean;
  error?: string;
}

/** 注册流式+非流式双模式工具 */
function registerAiTool(
  name: string,
  description: string,
  paramDefs: Record<string, any>,
  required: string[],
  systemPrompt: string,
  buildUserContent: (params: any) => string
) {
  // 流式版本
  Tools.register(`${name}_stream`, {
    description: `${description}（流式）`,
    parameters: { type: "object", properties: paramDefs, required },
    execute: async (params: any) => {
      const userContent = buildUserContent(params);
      try {
        const text = await callAiStreaming(systemPrompt, userContent, (chunk, accumulated) => {
          sendIntermediateResult({
            success: true,
            streaming: true,
            chunk,
            accumulated,
            done: false,
          } as StreamToolResult);
        });
        sendIntermediateResult({ success: true, streaming: true, text, done: true } as StreamToolResult);
        return { success: true, text };
      } catch (error) {
        const msg = (error as Error).message || "AI 调用失败";
        Logger.error(`${name} 流式调用失败`, error);
        return { success: false, error: msg };
      }
    },
  });

  // 非流式版本
  Tools.register(name, {
    description,
    parameters: { type: "object", properties: paramDefs, required },
    execute: async (params: any) => {
      const userContent = buildUserContent(params);
      try {
        const text = await callAi(systemPrompt, userContent);
        Logger.info(`${name} 完成`);
        return { success: true, text };
      } catch (error) {
        Logger.error(`${name} 失败`, error);
        return { success: false, error: (error as Error).message || `${name} 失败` };
      }
    },
  });
}

export function registerTools() {
  // 1. AI 续写
  registerAiTool(
    "novelide:continue_writing",
    "AI 续写，根据前文内容自动续写后续情节",
    {
      content: { type: "string", description: "前文内容" },
      workId: { type: "string", description: "作品ID" },
    },
    ["content"],
    "你是一个专业的网文写作助手，请根据前文内容续写，保持风格一致，情节连贯，续写约500字。",
    (p) => `请续写以下内容：\n${requireString(p.content, "content")}`
  );

  // 2. 文本精修
  registerAiTool(
    "novelide:polish_text",
    "AI 文本精修，优化语句表达、润色文笔",
    {
      content: { type: "string", description: "需要精修的文本内容" },
      workId: { type: "string", description: "作品ID" },
    },
    ["content"],
    "你是一个专业的文学编辑，请对文本进行精修润色，优化措辞、节奏和表达力，保持原文的核心意思和风格。",
    (p) => `请精修以下文本，优化语句表达，提升文笔质量，保持原意不变：\n${requireString(p.content, "content")}`
  );

  // 3. 扩写
  registerAiTool(
    "novelide:expand_text",
    "AI 扩写，将简短内容扩展为更详细的描写",
    {
      content: { type: "string", description: "需要扩写的文本内容" },
      workId: { type: "string", description: "作品ID" },
    },
    ["content"],
    "你是一个网文写作助手，请对文本进行扩写，添加生动的细节描写、人物心理、环境氛围等，使内容更加丰满有层次。",
    (p) => `请将以下内容进行扩写，增加细节描写、心理活动、环境渲染，使内容更加丰富饱满：\n${requireString(p.content, "content")}`
  );

  // 4. 去 AI 味
  registerAiTool(
    "novelide:deai_flavor",
    "去除 AI 痕迹，让文本更自然、更有人味",
    {
      content: { type: "string", description: "需要去 AI 味的文本内容" },
      workId: { type: "string", description: "作品ID" },
    },
    ["content"],
    "你是一个资深网文作者，请改写文本使其读起来像真人写的，避免AI常见的套路化表达、过度修饰和生硬转折，使用更自然的口语化表达。",
    (p) => `请改写以下文本，去除AI生成的痕迹，让语言更自然、更口语化、更有人味：\n${requireString(p.content, "content")}`
  );

  // 5. 爽点检查
  registerAiTool(
    "novelide:check_pleasure",
    "检查文本中的爽点设计，分析节奏和读者体验",
    {
      content: { type: "string", description: "需要检查的文本内容" },
      workId: { type: "string", description: "作品ID" },
    },
    ["content"],
    "你是一个网文编辑专家，擅长分析网文的爽点设计、节奏把控和读者体验。请从专业角度给出分析和改进建议。",
    (p) => `请分析以下网文内容的爽点设计，包括：\n1. 是否有明显的爽点和高潮\n2. 节奏是否合理\n3. 读者的情绪引导是否到位\n4. 改进建议\n\n内容：\n${requireString(p.content, "content")}`
  );

  // 6. 水文检测
  registerAiTool(
    "novelide:detect_water",
    "检测文本中的水文内容，识别冗余和无效描写",
    {
      content: { type: "string", description: "需要检测的文本内容" },
      workId: { type: "string", description: "作品ID" },
    },
    ["content"],
    "你是一个严格的网文质检编辑，擅长识别水文、注水内容。请逐段分析，标记出冗余和无效内容，并给出精简建议。",
    (p) => `请检测以下文本中的水文内容，标记出：\n1. 冗余重复的描写\n2. 无效的过渡段落\n3. 与主线无关的废话\n4. 注水嫌疑的段落\n5. 整体水文比例评估\n\n内容：\n${requireString(p.content, "content")}`
  );

  // 7. 爆款标题
  Tools.register("novelide:generate_title", {
    description: "AI 生成爆款标题，根据内容生成吸引读者的标题",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "章节或作品的内容摘要" },
        genre: { type: "string", description: "作品类型（如：都市、玄幻、悬疑）" },
        workId: { type: "string", description: "作品ID" },
      },
      required: ["content"],
    },
    execute: async (params: any) => {
      const content = requireString(params.content, "content");
      const genre = params.genre || "";
      const genreHint = genre ? `，作品类型为「${genre}」` : "";
      try {
        const text = await callAi(
          "你是一个网文标题策划专家，擅长创作吸引读者点击的爆款标题。请生成有冲击力、悬念感和吸引力的标题。",
          `请根据以下内容生成5个爆款标题${genreHint}，要求吸引眼球、引发好奇心、适合网文平台：\n${content}`
        );
        Logger.info("AI 标题生成完成");
        return { success: true, text };
      } catch (error) {
        Logger.error("AI 标题生成失败", error);
        return { success: false, error: (error as Error).message || "AI 标题生成失败" };
      }
    },
  });
}
