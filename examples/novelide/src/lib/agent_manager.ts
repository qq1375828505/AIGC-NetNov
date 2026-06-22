// Agent 管理器 - 管理7个预设智能体的终端会话
// 集成 Terminal.kt 的 createSession() API，让每个 Agent 在独立终端会话中运行

import { NovelAgentDispatcher, AGENT_CONFIGS } from "../packages/novel_agents.js";

/**
 * Agent 会话状态
 */
export interface AgentSession {
  /** Agent ID */
  agentId: string;
  /** 会话 ID（内部管理） */
  sessionId: string;
  /** 终端会话 ID（Terminal.kt 的会话） */
  terminalSessionId?: string;
  /** 创建时间 */
  createdAt: number;
  /** 最后活跃时间 */
  lastActiveAt: number;
  /** 当前状态 */
  status: "idle" | "busy" | "error";
  /** 最后结果 */
  lastResult?: string;
  /** 错误信息 */
  error?: string;
  /** 执行历史 */
  history: AgentHistoryEntry[];
}

/**
 * Agent 执行历史
 */
export interface AgentHistoryEntry {
  /** 任务描述 */
  task: string;
  /** 结果 */
  result: string;
  /** 时间戳 */
  timestamp: number;
  /** 耗时(ms) */
  duration: number;
}

/**
 * Agent 任务请求
 */
export interface AgentTask {
  /** 任务描述 */
  task: string;
  /** 作品 ID */
  workId?: string;
  /** 章节 ID */
  chapterId?: string;
  /** 附加上下文 */
  context?: Record<string, any>;
}

/**
 * Agent 任务结果
 */
export interface AgentResult {
  /** 是否成功 */
  success: boolean;
  /** 结果内容 */
  result?: string;
  /** 错误信息 */
  error?: string;
  /** 耗时（毫秒） */
  duration?: number;
}

/**
 * 预设 Agent 配置
 */
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

// 所有可用的 Agent 列表
const AVAILABLE_AGENTS: AgentConfig[] = [
  {
    id: "continue_writing",
    name: "续写助手",
    description: "根据前文内容自动续写后续情节",
    systemPrompt: "你是一个专业的网文写作助手。请根据前文内容进行续写，保持风格一致，情节连贯。"
  },
  {
    id: "polish",
    name: "文本精修器",
    description: "8维度精修文本",
    systemPrompt: AGENT_CONFIGS.polish.systemPrompt
  },
  {
    id: "expand",
    name: "扩写助手",
    description: "将简短内容扩展为更详细的描写",
    systemPrompt: "你是一个专业的文本扩写助手。请对文本进行扩写，添加生动的细节描写、人物心理、环境氛围等，使内容更加丰满有层次。"
  },
  {
    id: "deai",
    name: "去AI味处理器",
    description: "消除AI机械感",
    systemPrompt: AGENT_CONFIGS.deai.systemPrompt
  },
  {
    id: "outline",
    name: "大纲生成器",
    description: "生成结构清晰的大纲",
    systemPrompt: AGENT_CONFIGS.outline.systemPrompt
  },
  {
    id: "character",
    name: "角色设计师",
    description: "生成详细的角色设定卡",
    systemPrompt: AGENT_CONFIGS.character.systemPrompt
  },
  {
    id: "pleasure",
    name: "爽点检查器",
    description: "分析爽点密度和节奏",
    systemPrompt: AGENT_CONFIGS.pleasure.systemPrompt
  }
];

/**
 * Agent 管理器
 * 管理7个预设智能体的终端会话
 * 集成 Terminal.kt 的 createSession() API
 */
export class AgentManager {
  private sessions: Map<string, AgentSession> = new Map();
  private terminalInitialized: boolean = false;

  /**
   * 获取所有可用 Agent 列表
   */
  static getAvailableAgents(): AgentConfig[] {
    return AVAILABLE_AGENTS;
  }

  /**
   * 根据 ID 获取 Agent 配置
   */
  static getAgentConfig(agentId: string): AgentConfig | undefined {
    return AVAILABLE_AGENTS.find(a => a.id === agentId);
  }

  /**
   * 初始化终端环境
   * 调用 Terminal.kt 的 initialize()
   */
  async initializeTerminal(): Promise<boolean> {
    try {
      const result = await Tools.callNative("initializeTerminal", []);
      this.terminalInitialized = result === "true" || result === true;
      return this.terminalInitialized;
    } catch (error) {
      console.error("初始化终端失败:", error);
      return false;
    }
  }

  /**
   * 创建 Agent 会话
   * 同时创建对应的终端会话（参考 Terminal.kt 的 createSession()）
   * @param agentId Agent ID
   * @param enableTerminal 是否创建终端会话（默认 true）
   * @returns 会话信息
   */
  async createSession(agentId: string, enableTerminal: boolean = true): Promise<AgentSession> {
    const config = AgentManager.getAgentConfig(agentId);
    if (!config) {
      throw new Error(`未知的 Agent: ${agentId}`);
    }

    const sessionId = `session_${agentId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    let terminalSessionId: string | undefined;

    // 创建终端会话（参考 Terminal.kt 的 createSession API）
    if (enableTerminal) {
      try {
        if (!this.terminalInitialized) {
          await this.initializeTerminal();
        }
        // 调用 NativeBridge 创建终端会话，传入 Agent 名称作为标题
        const result = await Tools.callNative("createTerminalSession", [config.name]);
        terminalSessionId = typeof result === "string" ? result : result?.sessionId;
        console.log(`Agent ${config.name} 终端会话已创建: ${terminalSessionId}`);
      } catch (error) {
        console.warn(`创建终端会话失败，Agent ${config.name} 将使用纯 AI 模式:`, error);
      }
    }

    const session: AgentSession = {
      agentId,
      sessionId,
      terminalSessionId,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      status: "idle",
      history: []
    };

    this.sessions.set(session.sessionId, session);
    return session;
  }

  /**
   * 在终端会话中执行命令
   * @param sessionId Agent 会话 ID
   * @param command 要执行的命令
   * @returns 命令输出
   */
  async executeInTerminal(sessionId: string, command: string): Promise<string | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("会话不存在");
    }
    if (!session.terminalSessionId) {
      throw new Error("该会话没有终端环境");
    }

    try {
      const result = await Tools.callNative("executeTerminalCommand", [
        session.terminalSessionId,
        command
      ]);
      session.lastActiveAt = Date.now();
      return typeof result === "string" ? result : JSON.stringify(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`终端命令执行失败: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * 检查会话是否有终端环境
   */
  hasTerminal(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    return !!session?.terminalSessionId;
  }

  /**
   * 发送任务给 Agent
   * @param sessionId 会话 ID
   * @param task 任务请求
   * @returns 任务结果
   */
  async sendTask(sessionId: string, task: AgentTask): Promise<AgentResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, error: "会话不存在" };
    }

    const config = AgentManager.getAgentConfig(session.agentId);
    if (!config) {
      return { success: false, error: "Agent 配置不存在" };
    }

    session.status = "busy";
    session.lastActiveAt = Date.now();

    const startTime = Date.now();

    try {
      // 构建完整上下文
      let fullPrompt = task.task;
      if (task.context?.workTitle) {
        fullPrompt = `作品：${task.context.workTitle}\n${fullPrompt}`;
      }
      if (task.context?.chapterTitle) {
        fullPrompt = `章节：${task.context.chapterTitle}\n${fullPrompt}`;
      }

      // 如果有终端会话，先在终端中记录任务
      if (session.terminalSessionId) {
        try {
          await this.executeInTerminal(sessionId, `echo "[Agent ${config.name}] 开始任务: ${task.task.substring(0, 50)}..."`);
        } catch (e) {
          // 终端记录失败不影响主流程
        }
      }

      // 通过 NovelAgentDispatcher 调用 AI
      const result = await NovelAgentDispatcher.dispatch(
        session.agentId,
        fullPrompt,
        task.context
      );

      const duration = Date.now() - startTime;

      session.status = "idle";
      session.lastResult = result;

      // 记录到执行历史
      session.history.push({
        task: task.task,
        result,
        timestamp: Date.now(),
        duration
      });

      // 限制历史记录数量（最多保留 50 条）
      if (session.history.length > 50) {
        session.history = session.history.slice(-50);
      }

      return { success: true, result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      session.status = "error";
      session.error = errorMsg;

      // 记录失败到历史
      session.history.push({
        task: task.task,
        result: `错误: ${errorMsg}`,
        timestamp: Date.now(),
        duration
      });

      return { success: false, error: errorMsg, duration };
    }
  }

  /**
   * 获取 Agent 结果
   * @param sessionId 会话 ID
   * @returns 最后一次任务的结果
   */
  getResult(sessionId: string): { result?: string; error?: string; status: string } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { status: "error", error: "会话不存在" };
    }

    return {
      result: session.lastResult,
      error: session.error,
      status: session.status
    };
  }

  /**
   * 获取会话信息
   * @param sessionId 会话 ID
   * @returns 会话信息
   */
  getSession(sessionId: string): AgentSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 获取所有活跃会话
   * @returns 所有会话列表
   */
  getAllSessions(): AgentSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * 获取会话的执行历史
   * @param sessionId 会话 ID
   * @returns 执行历史列表
   */
  getSessionHistory(sessionId: string): AgentHistoryEntry[] {
    const session = this.sessions.get(sessionId);
    return session?.history || [];
  }

  /**
   * 关闭会话（同时关闭终端会话）
   * @param sessionId 会话 ID
   */
  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session?.terminalSessionId) {
      try {
        await Tools.callNative("closeTerminalSession", [session.terminalSessionId]);
        console.log(`Agent ${session.agentId} 终端会话已关闭: ${session.terminalSessionId}`);
      } catch (error) {
        console.warn("关闭终端会话失败:", error);
      }
    }
    this.sessions.delete(sessionId);
  }

  /**
   * 清理过期会话（超过1小时未活跃）
   */
  async cleanupSessions(): Promise<void> {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, session] of this.sessions) {
      if (session.lastActiveAt < oneHourAgo) {
        await this.closeSession(id);
      }
    }
  }
}

// 全局 Agent 管理器实例
let globalAgentManager: AgentManager | null = null;

/**
 * 获取全局 Agent 管理器
 */
export function getAgentManager(): AgentManager {
  if (!globalAgentManager) {
    globalAgentManager = new AgentManager();
  }
  return globalAgentManager;
}

/**
 * 便捷方法：创建会话并发送任务
 * @param agentId Agent ID
 * @param task 任务描述
 * @param context 附加上下文
 * @param enableTerminal 是否启用终端会话（默认 true）
 * @returns 任务结果
 */
export async function dispatchAgentTask(
  agentId: string,
  task: string,
  context?: Record<string, any>,
  enableTerminal: boolean = true
): Promise<AgentResult> {
  const manager = getAgentManager();
  const session = await manager.createSession(agentId, enableTerminal);
  return manager.sendTask(session.sessionId, { task, context });
}