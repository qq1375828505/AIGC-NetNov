# NavItem 扩展

> **状态：✅ 已完成（原生层备选方案）** | 文件：`app/src/main/java/com/ai/assistance/operit/ui/common/NavItem.kt`
> 新增7个NavItem：NovelWorks, NovelEditor, NovelMaterials, NovelOutline, NovelStats, NovelTools, NovelWorkspace
>
> **v3.0 说明**：优先使用 ToolPkg `registerNavigationEntry()` 注册导航入口（见 `08_屏幕注册.md`）。
> 本文件为原生层备选方案，仅在 ToolPkg 注册无法满足需求（如分组顺序、图标资源）时使用。

## 现有 NavItem（不动）

```kotlin
// NavItem.kt 中的原有定义
sealed class NavItem(val route: String, val titleResId: Int, val icon: ImageVector) {
    object AiChat : NavItem("ai_chat", R.string.nav_ai_chat, Icons.Default.Email)
    object AssistantConfig : NavItem("assistant_config", R.string.nav_assistant_config, Icons.Default.Tune)
    object Packages : NavItem("packages", R.string.nav_packages, Icons.Default.Extension)
    object MemoryBase : NavItem("memory_base", R.string.nav_memory_base, Icons.Default.History)
    object Toolbox : NavItem("toolbox", R.string.toolbox, Icons.Default.Apps)
    object ShizukuCommands : NavItem("shizuku_commands", R.string.shizuku_commands, Icons.Default.Build)
    object Workflow : NavItem("workflow", R.string.nav_workflow, Icons.Default.AccountTree)
    object Settings : NavItem("settings", R.string.nav_settings, Icons.Default.Settings)
    object Help : NavItem("help", R.string.nav_help, Icons.AutoMirrored.Filled.Help)
    object About : NavItem("about", R.string.nav_about, Icons.Default.Info)
    // ... 其他
}
```

## 新增 NavItem

在 `NavItem.kt` 的 `sealed class` 中追加：

```kotlin
// ====== 网文写作模块（新增） ======
object NovelWorks : NavItem("novel_works", R.string.nav_novel_works, Icons.Default.Book)
object NovelEditor : NavItem("novel_editor", R.string.nav_novel_editor, Icons.Default.Edit)
object NovelMaterials : NavItem("novel_materials", R.string.nav_novel_materials, Icons.Default.FolderSpecial)
object NovelOutline : NavItem("novel_outline", R.string.nav_novel_outline, Icons.Default.List)
object NovelStats : NavItem("novel_stats", R.string.nav_novel_stats, Icons.Default.BarChart)
object NovelTools : NavItem("novel_tools", R.string.nav_novel_tools, Icons.Default.AutoFixHigh)
object NovelWorkspace : NavItem("novel_workspace", R.string.nav_novel_workspace, Icons.Default.Workspaces)
```

## 需要添加的字符串资源

```xml
<!-- res/values/strings.xml -->
<string name="nav_novel_works">我的作品</string>
<string name="nav_novel_editor">写作编辑器</string>
<string name="nav_novel_materials">资料管理</string>
<string name="nav_novel_outline">大纲管理</string>
<string name="nav_novel_stats">写作统计</string>
<string name="nav_novel_tools">写作工具</string>
<string name="nav_novel_workspace">工作区</string>
```