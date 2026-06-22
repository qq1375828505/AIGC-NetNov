import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";
import SkillsPage from "./novel_skills_page.js";

export default function Screen(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const params = ctx.routeParams ?? {};

  return SkillsPage(ctx);
}
