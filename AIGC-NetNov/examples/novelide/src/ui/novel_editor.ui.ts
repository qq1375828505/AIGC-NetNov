import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

export default function Screen(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const params = ctx.routeParams ?? {};
  const workId = params.workId ?? "";

  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: `novel_editor_webview_${workId}`,
      fillMaxSize: true,
      url: `file:///android_asset/packages/novelide/resources/webapp/网文写作.html#editor?workId=${workId}`,
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
