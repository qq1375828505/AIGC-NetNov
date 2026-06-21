import novelWorksScreen from "./ui/novel_works.ui.js";
import novelEditorScreen from "./ui/novel_editor.ui.js";
import novelMaterialsScreen from "./ui/novel_materials.ui.js";
import novelOutlineScreen from "./ui/novel_outline.ui.js";
import novelStatsScreen from "./ui/novel_stats.ui.js";
import novelToolsScreen from "./ui/novel_tools.ui.js";
import novelWorkspaceScreen from "./ui/novel_workspace.ui.js";

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

  return true;
}
