import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";
import RelationshipPage from "./novel_relationship_page.js";

export default function Screen(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const params = ctx.routeParams ?? {};
  const workId = params.workId ?? "";

  return RelationshipPage(ctx);
}
