// 角色关系图页面 - 使用 WebView 加载 vis-network 实现关系图可视化

import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

export default function RelationshipPage(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const params = ctx.routeParams ?? {};
  const workId = params.workId ?? "";

  const [showToolbar, setShowToolbar] = ctx.useState("showToolbar", true);
  const [filterType, setFilterType] = ctx.useState("filterType", "all");
  const [searchQuery, setSearchQuery] = ctx.useState("searchQuery", "");

  // 通过 JS Bridge 向 WebView 发送指令
  function sendMessageToWebView(message: string) {
    ctx.evalJavascript?.("relationship_webview", message);
  }

  // 导出操作
  function exportAs(format: "svg" | "png") {
    sendMessageToWebView(`exportNetwork("${format}")`);
  }

  // 筛选关系类型
  function filterByType(type: string) {
    setFilterType(type);
    sendMessageToWebView(`filterByType("${type}")`);
  }

  // 搜索角色
  function searchCharacter(query: string) {
    setSearchQuery(query);
    sendMessageToWebView(`searchCharacter("${query}")`);
  }

  // 重置视图
  function resetView() {
    sendMessageToWebView("resetView()");
    setFilterType("all");
    setSearchQuery("");
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
        onClick: () => sendMessageToWebView("refreshData()")
      }),
      UI.IconButton({
        icon: "center_focus_strong",
        onClick: resetView,
        tooltip: "重置视图"
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
          sendMessageToWebView(`toggleGraphToolbar(${!showToolbar})`);
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
        { value: "family", label: "家族" },
        { value: "friend", label: "友情" },
        { value: "enemy", label: "敌对" },
        { value: "love", label: "爱情" },
        { value: "mentor", label: "师徒" }
      ],
      width: 120
    })
  ]);

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
    UI.Box({ fillMaxSize: true, weight: 1 }, webView)
  ]);
}
