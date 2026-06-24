"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Screen;
function Screen(ctx) {
    const { UI } = ctx;
    return UI.Box({ fillMaxSize: true }, UI.WebView({
        key: "novel_workspace_webview",
        fillMaxSize: true,
        url: "file:///android_asset/packages/novelide/resources/webapp/完整版.html#workspace",
        javaScriptEnabled: true,
        domStorageEnabled: true,
        allowFileAccess: true,
        allowContentAccess: true,
        supportZoom: true,
        useWideViewPort: true,
        loadWithOverviewMode: true,
    }));
}
