import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";
import TomatoPage from "./novel_tomato_page.js";

export default function Screen(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const params = ctx.routeParams ?? {};
  const workId = params.workId ?? "";

  return TomatoPage(ctx);
}
