// AI 桥接层 - 连接 HTML 前端和 AI 能力，支持流式响应

import { PROMPT_TEMPLATES } from "./prompt_templates.js";
import { ThoughtRenderer, ThinkingContent } from "./thought_renderer.js";
import { buildWorkContext, WorkContext } from "./context_builder.js";

/**
 * 流式响应事件
 */
export interface StreamEvent {
  /** 事件类型: "start" | "chunk" | "done" | "error" */
  type: string;
  /** 增量内容（仅 chunk 事件） */
  chunk?: string;
  /** 累积完整内容 */
  content?: string;
  /** 思考内容（从累积内容中实时提取） */
  thinking?: string;
  /** 是否正在思考中 */
  isThinking?: boolean;
  /** chunk 索引 */
  chunkIndex?: number;
  /** 已接收字符数 */
  receivedChars?: number;
  /** 错误信息（仅 error 事件） */
  error?: string;
}

/** 封装 Tools.Chat.sendMessage 调用，统一处理错误 */
async function callAi(systemPrompt: string, prompt: string): Promise<string> {
  const fullMessage = `[系统指令] ${systemPrompt}\n\n[用户请求] ${prompt}`;
  try {
    const result = await Tools.Chat.sendMessage(fullMessage);
    if (!result) {
      throw new Error("AI 调用失败：sendMessage 返回 undefined");
    }
    const aiReply = (result.aiResponse ?? "").trim();
    if (!aiReply) {
      throw new Error("AI 返回了空回复");
    }
    return aiReply;
  } catch (error) {
    console.error("AI 调用失败:", error);
    throw error;
  }
}

/**
 * 封装 Tools.Chat.sendMessageStreaming 调用，支持流式响应
 */
async function callAiStreaming(
  systemPrompt: string,
  prompt: string,
  onEvent: (event: StreamEvent) => void
): Promise<string> {
  const fullMessage = `[系统指令] ${systemPrompt}\n\n[用户请求] ${prompt}`;
  let accumulated = "";

  try {
    onEvent({ type: "start" });

    const result = await Tools.Chat.sendMessageStreaming(fullMessage, undefined, undefined, undefined, {
      onIntermediateResult: (event) => {
        if (event.type === "chunk" && event.chunk) {
          accumulated += event.chunk;
          const { thinkingContent } = ThoughtRenderer.extractThinkingContent(accumulated);
          const isThinking = ThoughtRenderer.isThinkingInProgress(accumulated);

          onEvent({
            type: "chunk",
            chunk: event.chunk,
            content: accumulated,
            thinking: thinkingContent,
            isThinking,
            chunkIndex: event.chunkIndex ?? undefined,
            receivedChars: event.receivedChars ?? undefined,
          });
        }
      },
    });

    if (!result) {
      throw new Error("AI 调用失败：sendMessageStreaming 返回 undefined");
    }

    const aiReply = (result.aiResponse ?? accumulated ?? "").trim();
    if (!aiReply) {
      throw new Error("AI 返回了空回复");
    }

    const { thinkingContent } = ThoughtRenderer.extractThinkingContent(aiReply);
    onEvent({
      type: "done",
      content: aiReply,
      thinking: thinkingContent,
      isThinking: false,
    });

    return aiReply;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    onEvent({ type: "error", error: errorMsg });
    throw error;
  }
}

export class NovelAIBridge {
  /**
   * 发送 AI 消息（带作品上下文）
   */
  static async sendNovelAiMessage(
    message: string,
    workId?: string,
    toolNames?: string[]
  ): Promise<string> {
    const context = await buildWorkContext(workId);
    const prompt = context.text ? `${context.text}\n${message}` : message;

    return callAi(
      "你是一个专业的网文写作助手，请根据上下文提供帮助。",
      prompt
    );
  }

  /**
   * 流式发送 AI 消息（带作品上下文）
   */
  static async sendNovelAiMessageStreaming(
    message: string,
    workId: string | undefined,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const context = await buildWorkContext(workId);
    const prompt = context.text ? `${context.text}\n${message}` : message;

    return callAiStreaming(
      "你是一个专业的网文写作助手，请根据上下文提供帮助。",
      prompt,
      onEvent
    );
  }

  /**
   * AI 续写
   */
  static async continueWriting(content: string, workId?: string): Promise<string> {
    const context = await buildWorkContext(workId);
    const prompt = PROMPT_TEMPLATES.continue_writing(content, context.text);
    return callAi("你是一个专业的网文写作助手。", prompt);
  }

  /**
   * AI 续写（流式）
   */
  static async continueWritingStreaming(
    content: string,
    workId: string | undefined,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const context = await buildWorkContext(workId);
    const prompt = PROMPT_TEMPLATES.continue_writing(content, context.text);
    return callAiStreaming("你是一个专业的网文写作助手。", prompt, onEvent);
  }

  /**
   * 文本精修
   */
  static async polishText(content: string): Promise<string> {
    const prompt = PROMPT_TEMPLATES.polish_text(content);
    return callAi("你是一个专业的文本润色助手。", prompt);
  }

  /**
   * 文本精修（流式）
   */
  static async polishTextStreaming(
    content: string,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const prompt = PROMPT_TEMPLATES.polish_text(content);
    return callAiStreaming("你是一个专业的文本润色助手。", prompt, onEvent);
  }

  /**
   * 扩写
   */
  static async expandText(content: string): Promise<string> {
    const prompt = PROMPT_TEMPLATES.expand_text(content);
    return callAi("你是一个专业的文本扩写助手。", prompt);
  }

  /**
   * 扩写（流式）
   */
  static async expandTextStreaming(
    content: string,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const prompt = PROMPT_TEMPLATES.expand_text(content);
    return callAiStreaming("你是一个专业的文本扩写助手。", prompt, onEvent);
  }

  /**
   * 去 AI 味
   */
  static async deaiFlavor(content: string): Promise<string> {
    const prompt = PROMPT_TEMPLATES.deai_flavor(content);
    return callAi("你是一个专业的文本改写助手。", prompt);
  }

  /**
   * 去 AI 味（流式）
   */
  static async deaiFlavorStreaming(
    content: string,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const prompt = PROMPT_TEMPLATES.deai_flavor(content);
    return callAiStreaming("你是一个专业的文本改写助手。", prompt, onEvent);
  }

  /**
   * 爽点检查
   */
  static async checkPleasure(content: string): Promise<any> {
    const prompt = PROMPT_TEMPLATES.check_pleasure(content);
    const result = await callAi("你是一个网文爽点分析助手。", prompt);

    try {
      return JSON.parse(result);
    } catch {
      return { raw: result };
    }
  }

  /**
   * 水文检测
   */
  static async detectWater(content: string): Promise<any> {
    const prompt = PROMPT_TEMPLATES.detect_water(content);
    const result = await callAi("你是一个网文质量检测助手。", prompt);

    try {
      return JSON.parse(result);
    } catch {
      return { raw: result };
    }
  }

  /**
   * 生成标题
   */
  static async generateTitle(content: string, genre?: string): Promise<string[]> {
    const prompt = PROMPT_TEMPLATES.generate_title(content, genre);
    const result = await callAi("你是一个爆款标题生成助手。", prompt);

    // 解析标题列表
    const titles = result.split("\n").filter(t => t.trim());
    return titles;
  }

  /**
   * 生成大纲
   */
  static async generateOutline(idea: string, genre?: string): Promise<any> {
    const prompt = PROMPT_TEMPLATES.generate_outline(idea, genre);
    const result = await callAi("你是一个网文大纲生成助手。", prompt);

    try {
      return JSON.parse(result);
    } catch {
      return { raw: result };
    }
  }

  /**
   * 设计角色
   */
  static async designCharacter(name: string, role: string, genre?: string): Promise<any> {
    const prompt = PROMPT_TEMPLATES.design_character(name, role, genre);
    const result = await callAi("你是一个角色设计助手。", prompt);

    try {
      return JSON.parse(result);
    } catch {
      return { raw: result };
    }
  }

  /**
   * 提取思维内容
   * @param content AI 响应内容
   * @returns 思维内容提取结果
   */
  static extractThinkingContent(content: string): ThinkingContent {
    return ThoughtRenderer.extractThinkingContent(content);
  }

  /**
   * 检测是否正在思考
   * @param content 当前内容
   * @returns 是否正在思考
   */
  static isThinkingInProgress(content: string): boolean {
    return ThoughtRenderer.isThinkingInProgress(content);
  }

  /**
   * 渲染完整消息（包含思考过程）
   * @param content 完整的 AI 响应
   * @param showThinking 是否显示思考过程
   * @param thinkingExpanded 思考过程是否默认展开
   * @returns 渲染后的 HTML
   */
  static renderFullMessage(
    content: string,
    showThinking: boolean = true,
    thinkingExpanded: boolean = false
  ): string {
    return ThoughtRenderer.renderFullMessage(content, showThinking, thinkingExpanded);
  }
}

// Tools 全局类型已由 examples/types/index.d.ts 提供，无需本地声明
