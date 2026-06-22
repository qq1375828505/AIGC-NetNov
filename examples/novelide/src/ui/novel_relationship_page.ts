// 角色关系图页面 - 增强版：节点点击编辑、桥接命令、交互优化

import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

export default function RelationshipPage(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const params = ctx.routeParams ?? {};
  const workId = params.workId ?? "";

  const [showToolbar, setShowToolbar] = ctx.useState("showToolbar", true);
  const [filterType, setFilterType] = ctx.useState("filterType", "all");
  const [searchQuery, setSearchQuery] = ctx.useState("searchQuery", "");
  const [showAddRelation, setShowAddRelation] = ctx.useState("showAddRelation", false);
  const [newRelation, setNewRelation] = ctx.useState("newRelation", { from: "", to: "", type: "" });

  // 通过 JS Bridge 向 WebView 发送指令
  function sendMessageToWebView(message: string) {
    ctx.evalJavascript?.("relationship_webview", message);
  }

  // 发送结构化命令到 WebView
  function sendBridgeCommand(action: string, data: any = {}) {
    const cmd = JSON.stringify({ action, ...data });
    sendMessageToWebView(`handleBridgeCommand('${cmd.replace(/'/g, "\\'")}')`);
  }

  // 导出操作
  function exportAs(format: "svg" | "png") {
    sendBridgeCommand("exportNetwork", { format });
  }

  // 筛选关系类型
  function filterByType(type: string) {
    setFilterType(type);
    sendBridgeCommand("filterByType", { type });
  }

  // 搜索角色
  function searchCharacter(query: string) {
    setSearchQuery(query);
    sendBridgeCommand("searchCharacter", { query });
  }

  // 重置视图
  function resetView() {
    sendBridgeCommand("resetView");
    setFilterType("all");
    setSearchQuery("");
  }

  // 添加新关系
  function addRelation() {
    if (!newRelation.from || !newRelation.to) return;
    sendBridgeCommand("addRelation", {
      from: newRelation.from,
      to: newRelation.to,
      type: newRelation.type || "未知"
    });
    setNewRelation({ from: "", to: "", type: "" });
    setShowAddRelation(false);
  }

  // 工具栏按钮
  const toolbar = UI.Row({
    fillMaxWidth: true,
    padding: 8,
    background: colors.surface,
    horizontalArrangement: "space-between"
  }, [
    UI.Row({ spacing: 8 }, [
      UI.Text({ text: "角色关系图", style: "titleMedium" }),
      UI.IconButton({
        icon: "refresh",
        onClick: () => sendBridgeCommand("refreshData"),
        tooltip: "刷新数据"
      }),
      UI.IconButton({
        icon: "center_focus_strong",
        onClick: resetView,
        tooltip: "重置视图"
      }),
      UI.IconButton({
        icon: "add_circle",
        onClick: () => setShowAddRelation(!showAddRelation),
        tooltip: "添加关系"
      })
    ]),
    UI.Row({ spacing: 8 }, [
      UI.IconButton({
        icon: "image",
        onClick: () => exportAs("png"),
        tooltip: "导出 PNG"
      }),
      UI.IconButton({
        icon: "description",
        onClick: () => exportAs("svg"),
        tooltip: "导出 SVG"
      }),
      UI.IconButton({
        icon: showToolbar ? "visibility-off" : "visibility",
        onClick: () => {
          setShowToolbar(!showToolbar);
          sendBridgeCommand("toggleGraphToolbar", { visible: !showToolbar });
        },
        tooltip: showToolbar ? "隐藏图工具栏" : "显示图工具栏"
      })
    ])
  ]);

  // 筛选和搜索栏
  const filterBar = UI.Row({
    fillMaxWidth: true,
    padding: { horizontal: 8, vertical: 4 },
    spacing: 8,
    verticalAlignment: "center"
  }, [
    UI.TextField({
      value: searchQuery,
      onValueChange: searchCharacter,
      label: "搜索角色",
      fillMaxWidth: true,
      leadingIcon: "search",
      modifier: UI.Modifier.weight(1)
    }),
    UI.Dropdown({
      label: "关系类型",
      value: filterType,
      onValueChange: filterByType,
      options: [
        { value: "all", label: "全部" },
        { value: "家族", label: "家族" },
        { value: "友情", label: "友情" },
        { value: "敌对", label: "敌对" },
        { value: "爱情", label: "爱情" },
        { value: "师徒", label: "师徒" },
        { value: "主仆", label: "主仆" },
        { value: "同门", label: "同门" }
      ],
      width: 120
    })
  ]);

  // 添加关系对话框
  function renderAddRelationDialog() {
    if (!showAddRelation) return null;

    return UI.Box({
      fillMaxSize: true,
      background: "rgba(0,0,0,0.5)",
      contentAlignment: "center"
    }, [
      UI.Card({
        modifier: UI.Modifier.padding(32).fillMaxWidth()
      }, UI.Column({
        padding: 16,
        spacing: 12
      }, [
        UI.Text({ text: "添加新关系", style: "titleMedium" }),
        UI.TextField({
          value: newRelation.from,
          onValueChange: (v: string) => setNewRelation({ ...newRelation, from: v }),
          label: "源头角色",
          fillMaxWidth: true
        }),
        UI.TextField({
          value: newRelation.to,
          onValueChange: (v: string) => setNewRelation({ ...newRelation, to: v }),
          label: "目标角色",
          fillMaxWidth: true
        }),
        UI.TextField({
          value: newRelation.type,
          onValueChange: (v: string) => setNewRelation({ ...newRelation, type: v }),
          label: "关系类型",
          fillMaxWidth: true
        }),
        UI.Row({
          spacing: 8,
          horizontalArrangement: "end"
        }, [
          UI.Button({
            onClick: () => setShowAddRelation(false),
            variant: "outlined"
          }, "取消"),
          UI.Button({
            onClick: addRelation,
            enabled: newRelation.from.trim().length > 0 && newRelation.to.trim().length > 0
          }, "添加")
        ])
      ]))
    ]);
  }

  // 使用提示
  const helpTip = UI.Card({
    modifier: UI.Modifier.padding(8).fillMaxWidth(),
    background: colors.surfaceVariant
  }, UI.Row({
    padding: 12,
    spacing: 8,
    verticalAlignment: "center"
  }, [
    UI.Icon({ name: "info", size: 16, tint: colors.primary }),
    UI.Text({
      text: "双击节点可编辑角色信息 | 拖拽移动节点 | 滚轮缩放 | 右键平移",
      style: "bodySmall",
      color: colors.onSurfaceVariant
    })
  ]));

  // WebView 加载关系图 HTML
  const webView = UI.WebView({
    key: "relationship_webview",
    fillMaxSize: true,
    url: `file:///android_asset/packages/novelide/resources/webapp/角色关系图.html?workId=${workId}`,
    javaScriptEnabled: true,
    domStorageEnabled: true,
    allowFileAccess: true,
    allowContentAccess: true,
    supportZoom: true,
    useWideViewPort: true,
    loadWithOverviewMode: true
  });

  return UI.Column({ fillMaxSize: true }, [
    toolbar,
    filterBar,
    helpTip,
    UI.Box({ fillMaxSize: true, weight: 1 }, webView),
    renderAddRelationDialog()
  ]);
}
