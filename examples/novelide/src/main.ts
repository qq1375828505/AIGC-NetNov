import novelWorksScreen from "./ui/novel_works.ui.js";
import novelEditorScreen from "./ui/novel_editor.ui.js";
import novelMaterialsScreen from "./ui/novel_materials.ui.js";
import novelOutlineScreen from "./ui/novel_outline.ui.js";
import novelStatsScreen from "./ui/novel_stats.ui.js";
import novelToolsScreen from "./ui/novel_tools.ui.js";
import novelWorkspaceScreen from "./ui/novel_workspace.ui.js";
import novelIOScreen from "./ui/novel_io.ui.js";
import novelRelationshipScreen from "./ui/novel_relationship.ui.js";
import novelTomatoScreen from "./ui/novel_tomato.ui.js";

import { registerTools as registerNovelWorksTools } from "./packages/novel_works";
import { registerTools as registerNovelChaptersTools } from "./packages/novel_chapters";
import { registerTools as registerNovelMaterialsTools } from "./packages/novel_materials";
import { registerTools as registerNovelAiTools } from "./packages/novel_ai_tools";
import { registerTools as registerNovelIoTools } from "./packages/novel_io";
import { registerTools as registerNovelStatsTools } from "./packages/novel_stats";
import { registerTools as registerNovelAgentsTools } from "./packages/novel_agents";

const NOVEL_BASE_ROUTE = "toolpkg:com.operit.novelide:ui";

export function registerToolPkg(): boolean {

  // ========================================
  // 注册 7 个侧边栏入口
  // ========================================

  ToolPkg.registerNavigationEntry({
    id: "novel_works_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_works`,
    surface: "main_sidebar_plugins",
    title: { zh: "我的作品", en: "My Works" },
    icon: Icons.Book,
    order: 120,
  });

  ToolPkg.registerNavigationEntry({
    id: "novel_editor_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_editor`,
    surface: "main_sidebar_plugins",
    title: { zh: "写作编辑器", en: "Novel Editor" },
    icon: Icons.Edit,
    order: 130,
  });

  ToolPkg.registerNavigationEntry({
    id: "novel_materials_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_materials`,
    surface: "main_sidebar_plugins",
    title: { zh: "资料管理", en: "Materials" },
    icon: Icons.FolderSpecial,
    order: 140,
  });

  ToolPkg.registerNavigationEntry({
    id: "novel_outline_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_outline`,
    surface: "main_sidebar_plugins",
    title: { zh: "大纲管理", en: "Outline" },
    icon: Icons.List,
    order: 150,
  });

  ToolPkg.registerNavigationEntry({
    id: "novel_stats_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_stats`,
    surface: "main_sidebar_plugins",
    title: { zh: "写作统计", en: "Statistics" },
    icon: Icons.BarChart,
    order: 160,
  });

  ToolPkg.registerNavigationEntry({
    id: "novel_tools_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_tools`,
    surface: "main_sidebar_plugins",
    title: { zh: "写作工具", en: "Tools" },
    icon: Icons.AutoFixHigh,
    order: 170,
  });

  ToolPkg.registerNavigationEntry({
    id: "novel_workspace_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_workspace`,
    surface: "main_sidebar_plugins",
    title: { zh: "工作区", en: "Workspace" },
    icon: Icons.Workspaces,
    order: 180,
  });

  ToolPkg.registerNavigationEntry({
    id: "novel_io_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_io`,
    surface: "main_sidebar_plugins",
    title: { zh: "导入导出", en: "Import/Export" },
    icon: Icons.ImportExport,
    order: 190,
  });

  ToolPkg.registerNavigationEntry({
    id: "novel_relationship_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_relationship`,
    surface: "main_sidebar_plugins",
    title: { zh: "角色关系图", en: "Relationships" },
    icon: Icons.AccountTree,
    order: 200,
  });

  ToolPkg.registerNavigationEntry({
    id: "novel_tomato_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_tomato`,
    surface: "main_sidebar_plugins",
    title: { zh: "番茄钟", en: "Pomodoro" },
    icon: Icons.Timer,
    order: 210,
  });

  // ========================================
  // 注册 7 个 UI 路由
  // ========================================

  ToolPkg.registerUiRoute({
    id: "novel_works",
    route: `${NOVEL_BASE_ROUTE}:novel_works`,
    runtime: "compose_dsl",
    screen: novelWorksScreen,
    params: {},
    title: { zh: "我的作品", en: "My Works" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_editor",
    route: `${NOVEL_BASE_ROUTE}:novel_editor`,
    runtime: "compose_dsl",
    screen: novelEditorScreen,
    params: { workId: "string" },
    title: { zh: "写作编辑器", en: "Novel Editor" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_materials",
    route: `${NOVEL_BASE_ROUTE}:novel_materials`,
    runtime: "compose_dsl",
    screen: novelMaterialsScreen,
    params: { workId: "string" },
    title: { zh: "资料管理", en: "Materials" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_outline",
    route: `${NOVEL_BASE_ROUTE}:novel_outline`,
    runtime: "compose_dsl",
    screen: novelOutlineScreen,
    params: { workId: "string" },
    title: { zh: "大纲管理", en: "Outline" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_stats",
    route: `${NOVEL_BASE_ROUTE}:novel_stats`,
    runtime: "compose_dsl",
    screen: novelStatsScreen,
    params: {},
    title: { zh: "写作统计", en: "Statistics" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_tools",
    route: `${NOVEL_BASE_ROUTE}:novel_tools`,
    runtime: "compose_dsl",
    screen: novelToolsScreen,
    params: {},
    title: { zh: "写作工具", en: "Tools" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_workspace",
    route: `${NOVEL_BASE_ROUTE}:novel_workspace`,
    runtime: "compose_dsl",
    screen: novelWorkspaceScreen,
    params: {},
    title: { zh: "工作区", en: "Workspace" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_io",
    route: `${NOVEL_BASE_ROUTE}:novel_io`,
    runtime: "compose_dsl",
    screen: novelIOScreen,
    params: { workId: "string" },
    title: { zh: "导入导出", en: "Import/Export" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_relationship",
    route: `${NOVEL_BASE_ROUTE}:novel_relationship`,
    runtime: "compose_dsl",
    screen: novelRelationshipScreen,
    params: { workId: "string" },
    title: { zh: "角色关系图", en: "Relationships" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_tomato",
    route: `${NOVEL_BASE_ROUTE}:novel_tomato`,
    runtime: "compose_dsl",
    screen: novelTomatoScreen,
    params: {},
    title: { zh: "番茄钟", en: "Pomodoro" },
  });

  // ========================================
  // 注册各工具包的工具（共 66 个工具）
  // ========================================

  registerNovelWorksTools();       // 5 个工具：作品 CRUD
  registerNovelChaptersTools();   // 6 个工具：章节管理
  registerNovelMaterialsTools();  // 40 个工具：资料管理（角色/设定/地点/势力/道具/伏笔/参考资料/待办）
  registerNovelAiTools();         // 7 个工具：AI 续写/精修/扩写/去AI味/爽点/水文/标题
  registerNovelIoTools();         // 4 个工具：导入导出
  registerNovelStatsTools();      // 3 个工具：写作统计
  registerNovelAgentsTools();     // 2 个工具：子Agent调度/章节审核

  return true;
}
