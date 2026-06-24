import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";
import AgentsPage from "./novel_agents_page.js";

export default function Screen(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const params = ctx.routeParams ?? {};

  return AgentsPage(ctx);
}
