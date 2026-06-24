// 子 Agent 调度系统

export const AGENT_CONFIGS = {
  outline: {
    id: "outline",
    name: "大纲生成器",
    description: "生成结构清晰的大纲",
    systemPrompt: `你是一个专业的大纲生成助手。请根据用户提供的创意生成详细的小说大纲。

大纲应包含：
1. 核心设定（世界观、主角、金手指）
2. 主线剧情（起承转合）
3. 主要配角设定
4. 关键转折点
5. 爽点设计

请以结构化的格式输出。`
  },

  character: {
    id: "character",
    name: "角色设计师",
    description: "生成详细的角色设定卡",
    systemPrompt: `你是一个专业的角色设计师。请根据用户提供的信息生成详细的角色设定卡。

角色卡应包含：
1. 基本信息（姓名、年龄、性别、外貌）
2. 性格特点（优点、缺点、口头禅）
3. 背景故事
4. 能力/技能
5. 人际关系
6. 成长弧线

请以 JSON 格式输出。`
  },

  pleasure: {
    id: "pleasure",
    name: "爽点检查器",
    description: "分析爽点密度和节奏",
    systemPrompt: `你是一个网文爽点分析专家。请分析用户提供的文本的爽点分布。

分析维度：
1. 爽点类型（打脸/逆袭/揭秘/升级等）
2. 爽点强度（1-5 分）
3. 爽点密度（每千字爽点数）
4. 节奏把控
5. 改进建议

请以 JSON 格式输出分析结果。`
  },

  water: {
    id: "water",
    name: "水文检测器",
    description: "检测凑字数/重复内容",
    systemPrompt: `你是一个网文质量检测专家。请检测用户提供的文本是否存在"水文"问题。

检测维度：
1. 重复啰嗦的表达
2. 无意义的填充词
3. 拖沓的情节
4. 缺乏信息量的段落
5. 总体质量评分

请以 JSON 格式输出检测结果和修改建议。`
  },

  title: {
    id: "title",
    name: "爆款标题器",
    description: "生成有悬念感的标题",
    systemPrompt: `你是一个爆款标题生成专家。请根据用户提供的内容生成吸引人的标题。

要求：
1. 有悬念感
2. 符合网文风格
3. 突出核心卖点
4. 10-20 字以内

请生成 5 个备选标题，并说明每个标题的卖点。`
  },

  deai: {
    id: "deai",
    name: "去AI味处理器",
    description: "消除AI机械感",
    systemPrompt: `你是一个文本改写专家。请对用户提供的文本进行改写，去除 AI 生成的痕迹。

改写要求：
1. 使用更自然的表达
2. 增加口语化表达
3. 避免过于工整的句式
4. 加入个性化表达
5. 保持原意不变

请直接输出改写后的文本。`
  },

  polish: {
    id: "polish",
    name: "文本精修器",
    description: "8维度精修文本",
    systemPrompt: `你是一个专业的文本精修专家。请从以下 8 个维度对用户提供的文本进行精修：

1. 语言流畅度
2. 逻辑连贯性
3. 细节丰富度
4. 情感表达力
5. 场景画面感
6. 人物塑造
7. 节奏把控
8. 文学性

请输出精修后的文本，并说明主要修改点。`
  }
};

// Agent 调度器
export class NovelAgentDispatcher {
  /**
   * 调用子 Agent
   */
  static async dispatch(agentId: string, task: string, context?: any): Promise<string> {
    const agent = AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS];
    if (!agent) {
      throw new Error(`未知的 Agent: ${agentId}`);
    }

    // 构建上下文
    let fullPrompt = task;
    if (context?.workTitle) {
      fullPrompt = `作品：${context.workTitle}\n${fullPrompt}`;
    }
    if (context?.chapterTitle) {
      fullPrompt = `章节：${context.chapterTitle}\n${fullPrompt}`;
    }

    // 调用 AI
    const result = await Tools.Chat({
      messages: [{ role: "user", content: fullPrompt }],
      systemPrompt: agent.systemPrompt
    });

    return result;
  }

  /**
   * 获取所有 Agent 列表
   */
  static getAgents(): Array<{ id: string; name: string; description: string }> {
    return Object.values(AGENT_CONFIGS).map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description
    }));
  }
}

// 注册 Agent 工具
export function registerTools() {
  // 注册 Agent 调度工具
  Tools.register("novelide:dispatch_subagent", {
    description: "调用子 Agent 处理任务",
    parameters: {
      type: "object",
      properties: {
        agentId: {
          type: "string",
          description: "Agent ID（outline/character/pleasure/water/title/deai/polish）"
        },
        task: { type: "string", description: "任务描述" },
        workId: { type: "string", description: "作品ID（可选）" }
      },
      required: ["agentId", "task"]
    },
    execute: async (params: any) => {
      const { agentId, task, workId } = params;
      const context: any = {};

      // 获取作品上下文
      if (workId) {
        try {
          const works = JSON.parse(await Tools.callNative("getNovelWorks", []));
          const work = works.find((w: any) => w.id === workId);
          if (work) {
            context.workTitle = work.title;
          }
        } catch (e) {
          // 忽略错误
        }
      }

      const result = await NovelAgentDispatcher.dispatch(agentId, task, context);
      return { success: true, result };
    }
  });

  // 注册章节审核工具
  Tools.register("novelide:review_chapter", {
    description: "AI 审核章节质量",
    parameters: {
      type: "object",
      properties: {
        chapterId: { type: "string", description: "章节ID" },
        workId: { type: "string", description: "作品ID" }
      },
      required: ["chapterId"]
    },
    execute: async (params: any) => {
      const { chapterId, workId } = params;

      // 获取章节内容
      const content = await Tools.callNative("getChapterContent", [chapterId]);

      // 调用多个 Agent 分析
      const [pleasureResult, waterResult, polishResult] = await Promise.all([
        NovelAgentDispatcher.dispatch("pleasure", content),
        NovelAgentDispatcher.dispatch("water", content),
        NovelAgentDispatcher.dispatch("polish", content)
      ]);

      return {
        success: true,
        review: {
          pleasure: JSON.parse(pleasureResult),
          water: JSON.parse(waterResult),
          polish: polishResult
        }
      };
    }
  });
}
