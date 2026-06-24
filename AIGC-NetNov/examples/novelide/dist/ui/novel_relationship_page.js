"use strict";
// 角色关系图页面 - 使用 WebView 加载 vis-network 实现关系图可视化
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RelationshipPage;
function RelationshipPage(ctx) {
    const { UI } = ctx;
    const colors = ctx.MaterialTheme.colorScheme;
    const params = ctx.routeParams ?? {};
    const workId = params.workId ?? "";
    const [showToolbar, setShowToolbar] = ctx.useState("showToolbar", true);
    // 通过 JS Bridge 向 WebView 发送指令
    function sendMessageToWebView(message) {
        ctx.evalJavascript?.("relationship_webview", message);
    }
    // 导出操作
    function exportAs(format) {
        sendMessageToWebView(`exportNetwork("${format}")`);
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
        UI.Box({ fillMaxSize: true, weight: 1 }, webView)
    ]);
}
