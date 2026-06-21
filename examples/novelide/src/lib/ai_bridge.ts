// AI 桥接层 - 连接 HTML 前端和 AI 能力

import { PROMPT_TEMPLATES } from "./prompt_templates.js";

/** 封装 Tools.Chat.sendMessage 调用，统一处理错误 */
async function callAi(systemPrompt: string, prompt: string): Promise<string> {
  const fullMessage = `[系统指令] ${systemPrompt}\n\n[用户请求] ${prompt}`;
  const result = await Tools.Chat.sendMessage(fullMessage);
  if (result.success && result.data) {
    return result.data.message;
  } else {
    throw new Error(result.error || "AI 调用失败");
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
    // 获取作品上下文
    let context = "";
    if (workId) {
      try {
        const works = JSON.parse(await window.NativeBridge.getNovelWorks());
        const work = works.find((w: any) => w.id === workId);
        if (work) {
          context += `作品：${work.title}\n类型：${work.genre}\n`;
        }
      } catch (e) {
        // 忽略错误
      }
    }

    // 构建完整消息
    const prompt = context ? `${context}\n${message}` : message;

    return callAi(
      "你是一个专业的网文写作助手，请根据上下文提供帮助。",
      prompt
    );
  }

  /**
   * AI 续写
   */
  static async continueWriting(content: string, workId?: string): Promise<string> {
    let context = "";
    if (workId) {
      try {
        const works = JSON.parse(await window.NativeBridge.getNovelWorks());
        const work = works.find((w: any) => w.id === workId);
        if (work) {
          context = `作品：${work.title}，类型：${work.genre}`;
        }
      } catch (e) {
        // 忽略错误
      }
    }

    const prompt = PROMPT_TEMPLATES.continue_writing(content, context);
    return callAi("你是一个专业的网文写作助手。", prompt);
  }

  /**
   * 文本精修
   */
  static async polishText(content: string): Promise<string> {
    const prompt = PROMPT_TEMPLATES.polish_text(content);
    return callAi("你是一个专业的文本润色助手。", prompt);
  }

  /**
   * 扩写
   */
  static async expandText(content: string): Promise<string> {
    const prompt = PROMPT_TEMPLATES.expand_text(content);
    return callAi("你是一个专业的文本扩写助手。", prompt);
  }

  /**
   * 去 AI 味
   */
  static async deaiFlavor(content: string): Promise<string> {
    const prompt = PROMPT_TEMPLATES.deai_flavor(content);
    return callAi("你是一个专业的文本改写助手。", prompt);
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
}

// 声明全局 Tools 接口
declare global {
  const Tools: {
    register(name: string, config: any): void;
    callNative(method: string, args: any[]): Promise<any>;
    Chat: {
      sendMessage(message: string, chatId?: string, roleCardId?: string, senderName?: string, options?: any): Promise<{
        success: boolean;
        data?: { message: string; thinking?: string; chatId: string; messageId: string };
        error?: string;
      }>;
      sendMessageStreaming(message: string, chatId?: string, roleCardId?: string, senderName?: string, options?: any): Promise<any>;
      createNew(group?: string): Promise<any>;
      findChat(params: any): Promise<any>;
      listAll(): Promise<any>;
    };
  };
}
