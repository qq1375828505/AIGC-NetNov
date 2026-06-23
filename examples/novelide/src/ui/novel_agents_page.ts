// Agent 管理页面 - 7个预设智能体的管理界面

import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

export default function AgentsPage(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;

  const [agents, setAgents] = ctx.useState("agents", []);
  const [sessions, setSessions] = ctx.useState("sessions", []);
  const [selectedAgent, setSelectedAgent] = ctx.useState("selectedAgent", null);
  const [taskInput, setTaskInput] = ctx.useState("taskInput", "");
  const [isProcessing, setIsProcessing] = ctx.useState("isProcessing", false);
  const [lastResult, setLastResult] = ctx.useState("lastResult", null);

  // Agent 配置列表
  const AGENT_LIST = [
    { id: "continue_writing", name: "续写助手", description: "根据前文内容自动续写后续情节", icon: "✍️" },
    { id: "polish", name: "文本精修器", description: "8维度精修文本", icon: "✨" },
    { id: "expand", name: "扩写助手", description: "将简短内容扩展为更详细的描写", icon: "📝" },
    { id: "deai", name: "去AI味处理器", description: "消除AI机械感", icon: "🤖" },
    { id: "outline", name: "大纲生成器", description: "生成结构清晰的大纲", icon: "📋" },
    { id: "character", name: "角色设计师", description: "生成详细的角色设定卡", icon: "👤" },
    { id: "pleasure", name: "爽点检查器", description: "分析爽点密度和节奏", icon: "🎯" }
  ];

  // 发送任务给 Agent
  async function sendTask() {
    if (!selectedAgent || !taskInput.trim()) return;

    setIsProcessing(true);
    setLastResult(null);

    try {
      const result = await Tools.callNative("dispatchAgentTask", [
        selectedAgent,
        taskInput,
        {}
      ]);

      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      setLastResult(parsed);

      // 刷新会话列表
      loadSessions();
    } catch (error) {
      setLastResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsProcessing(false);
    }
  }

  // 加载活跃会话
  async function loadSessions() {
    try {
      const result = await Tools.callNative("getAgentSessions", []);
      const list = typeof result === "string" ? JSON.parse(result) : result;
      setSessions(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("加载会话失败:", error);
    }
  }

  // 初始化
  ctx.useEffect(() => {
    setAgents(AGENT_LIST);
    loadSessions();
  }, []);

  // 顶部栏
  const topBar = UI.TopAppBar({
    title: "AI Agent 管理",
    actions: [
      UI.IconButton({
        icon: "refresh",
        onClick: loadSessions,
        contentDescription: "刷新会话列表"
      })
    ]
  });

  // Agent 卡片列表
  const agentCards = UI.Column({
    fillMaxWidth: true,
    spacing: 8,
    paddingHorizontal: 16
  }, [
    UI.Text({
      text: "可用 Agent（7个）",
      style: "titleMedium",
      color: colors.onSurface,
      modifier: UI.Modifier.paddingVertical(8)
    }),
    ...AGENT_LIST.map(agent =>
      UI.Card({
        modifier: UI.Modifier
          .fillMaxWidth()
          .clickable(() => setSelectedAgent(agent.id))
          .padding(4),
        background: selectedAgent === agent.id ? colors.primaryContainer : colors.surface
      }, UI.Row({
        fillMaxWidth: true,
        padding: 16,
        spacing: 16,
        verticalAlignment: "center"
      }, [
        UI.Text({
          text: agent.icon,
          style: "headlineMedium"
        }),
        UI.Column({
          weight: 1
        }, [
          UI.Text({
            text: agent.name,
            style: "titleSmall",
            color: selectedAgent === agent.id ? colors.onPrimaryContainer : colors.onSurface
          }),
          UI.Text({
            text: agent.description,
            style: "bodySmall",
            color: selectedAgent === agent.id ? colors.onPrimaryContainer : colors.onSurfaceVariant,
            maxLines: 2
          })
        ]),
        selectedAgent === agent.id ? UI.Icon({
          icon: "check_circle",
          tint: colors.primary,
          contentDescription: `${agent.name}已选中`
        }) : null
      ].filter(Boolean)))
    )
  ]);

  // 任务输入区域
  const taskArea = UI.Card({
    modifier: UI.Modifier.padding(16).fillMaxWidth(),
    background: colors.surfaceVariant
  }, UI.Column({
    fillMaxWidth: true,
    padding: 16,
    spacing: 12
  }, [
    UI.Text({
      text: selectedAgent ? `任务给: ${AGENT_LIST.find(a => a.id === selectedAgent)?.name || selectedAgent}` : "请先选择一个 Agent",
      style: "titleSmall",
      color: colors.onSurfaceVariant
    }),
    UI.TextField({
      value: taskInput,
      onValueChange: setTaskInput,
      label: "输入任务描述",
      placeholder: "例如：帮我续写这段文字...",
      fillMaxWidth: true,
      minLines: 3,
      maxLines: 5,
      enabled: !!selectedAgent
    }),
    UI.Button({
      onClick: sendTask,
      enabled: !!selectedAgent && taskInput.trim().length > 0 && !isProcessing,
      fillMaxWidth: true
    }, isProcessing ? "处理中..." : "发送任务")
  ]));

  // 结果显示区域
  const resultArea = lastResult ? UI.Card({
    modifier: UI.Modifier.padding(16).fillMaxWidth(),
    background: lastResult.success ? colors.tertiaryContainer : colors.errorContainer
  }, UI.Column({
    fillMaxWidth: true,
    padding: 16,
    spacing: 8
  }, [
    UI.Text({
      text: lastResult.success ? "执行结果" : "执行失败",
      style: "titleSmall",
      color: lastResult.success ? colors.onTertiaryContainer : colors.onErrorContainer
    }),
    UI.Text({
      text: lastResult.success ? (lastResult.result || "无结果") : (lastResult.error || "未知错误"),
      style: "bodyMedium",
      color: lastResult.success ? colors.onTertiaryContainer : colors.onErrorContainer
    }),
    lastResult.duration ? UI.Text({
      text: `耗时: ${lastResult.duration}ms`,
      style: "bodySmall",
      color: colors.onSurfaceVariant
    }) : null
  ].filter(Boolean))) : null;

  // 会话列表
  const sessionsArea = sessions.length > 0 ? UI.Column({
    fillMaxWidth: true,
    paddingHorizontal: 16,
    spacing: 8
  }, [
    UI.Text({
      text: `活跃会话 (${sessions.length})`,
      style: "titleSmall",
      color: colors.onSurface,
      modifier: UI.Modifier.paddingVertical(8)
    }),
    ...sessions.slice(0, 5).map(session =>
      UI.Card({
        modifier: UI.Modifier.fillMaxWidth().padding(4),
        background: colors.surface
      }, UI.Row({
        fillMaxWidth: true,
        padding: 12,
        spacing: 12,
        verticalAlignment: "center"
      }, [
        UI.Box({
          width: 8,
          height: 8,
          background: session.status === "busy" ? colors.error : 
                     session.status === "error" ? colors.error : colors.primary,
          cornerRadius: 4
        }),
        UI.Column({
          weight: 1
        }, [
          UI.Text({
            text: `Agent: ${session.agentId}`,
            style: "bodyMedium"
          }),
          UI.Text({
            text: `状态: ${session.status}`,
            style: "bodySmall",
            color: colors.onSurfaceVariant
          })
        ])
      ]))
    )
  ]) : null;

  // 主布局
  return UI.Box({ fillMaxSize: true }, [
    topBar,
    UI.LazyColumn({
      fillMaxSize: true,
      contentPadding: 16,
      verticalArrangement: 12
    }, [
      agentCards,
      taskArea,
      resultArea,
      sessionsArea
    ].filter(Boolean))
  ]);
}
