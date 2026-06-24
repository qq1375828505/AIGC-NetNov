import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

export default function Screen(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;

  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: "novel_tools_webview",
      fillMaxSize: true,
      url: "file:///android_asset/packages/novelide/resources/webapp/工具箱.html",
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true,
    })
  );
}
