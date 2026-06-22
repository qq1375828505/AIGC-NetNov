// Agent 管理器 - 管理7个预设智能体的终端会话

import { NovelAgentDispatcher, AGENT_CONFIGS } from "../packages/novel_agents.js";

/**
 * Agent 会话状态
 */
export interface AgentSession {
  /** Agent ID */
  agentId: string;
  /** 会话 ID */
  sessionId: string;
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
 */
export class AgentManager {
  private sessions: Map<string, AgentSession> = new Map();

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
   * 创建 Agent 会话
   * @param agentId Agent ID
   * @returns 会话信息
   */
  createSession(agentId: string): AgentSession {
    const config = AgentManager.getAgentConfig(agentId);
    if (!config) {
      throw new Error(`未知的 Agent: ${agentId}`);
    }

    const session: AgentSession = {
      agentId,
      sessionId: `session_${agentId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      status: "idle"
    };

    this.sessions.set(session.sessionId, session);
    return session;
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

      // 通过 NovelAgentDispatcher 调用 AI
      const result = await NovelAgentDispatcher.dispatch(
        session.agentId,
        fullPrompt,
        task.context
      );

      const duration = Date.now() - startTime;

      session.status = "idle";
      session.lastResult = result;

      return { success: true, result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      session.status = "error";
      session.error = errorMsg;

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
   * 关闭会话
   * @param sessionId 会话 ID
   */
  closeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * 清理过期会话（超过1小时未活跃）
   */
  cleanupSessions(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, session] of this.sessions) {
      if (session.lastActiveAt < oneHourAgo) {
        this.sessions.delete(id);
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
 * @returns 任务结果
 */
export async function dispatchAgentTask(
  agentId: string,
  task: string,
  context?: Record<string, any>
): Promise<AgentResult> {
  const manager = getAgentManager();
  const session = manager.createSession(agentId);
  return manager.sendTask(session.sessionId, { task, context });
}