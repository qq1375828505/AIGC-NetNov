import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";
import IOPage from "./novel_io_page.js";

export default function Screen(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const params = ctx.routeParams ?? {};
  const workId = params.workId ?? "";

  return IOPage(ctx, workId);
}
