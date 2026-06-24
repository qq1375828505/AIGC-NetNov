import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";
import OutlinePage from "./novel_outline_page.js";

export default function Screen(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const params = ctx.routeParams ?? {};

  return OutlinePage(ctx);
}
