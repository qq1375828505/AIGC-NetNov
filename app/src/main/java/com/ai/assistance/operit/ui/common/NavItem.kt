package com.ai.assistance.operit.ui.common

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountTree
import androidx.compose.material.icons.filled.Apps
import androidx.compose.material.icons.filled.AutoFixHigh
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Extension
import androidx.compose.material.icons.filled.Face
import androidx.compose.material.icons.filled.FolderSpecial
import androidx.compose.material.icons.automirrored.filled.Help
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.material.icons.filled.Token
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Workspaces
import androidx.compose.ui.graphics.vector.ImageVector
import com.ai.assistance.operit.R

// 应用导航项
sealed class NavItem(val route: String, val titleResId: Int, val icon: ImageVector) {
        object AiChat : NavItem("ai_chat", R.string.nav_ai_chat, Icons.Default.Email)
        object ShizukuCommands :
                NavItem("shizuku_commands", R.string.shizuku_commands, Icons.Default.Build)
        object AssistantConfig :
                NavItem("assistant_config", R.string.nav_assistant_config, Icons.Default.Tune)
        object Settings : NavItem("settings", R.string.nav_settings, Icons.Default.Settings)
        object ToolPermissions :
                NavItem("tool_permissions", R.string.tool_permissions, Icons.Default.Security)
        object UserPreferencesGuide :
                NavItem(
                        "user_preferences_guide",
                        R.string.user_preferences_guide,
                        Icons.Default.Person
                )
        object UserPreferencesSettings :
                NavItem(
                        "user_preferences_settings",
                        R.string.user_preferences_settings,
                        Icons.Default.Face
                )
        object ChatHistorySettings :
                NavItem(
                        "chat_history_settings",
                        R.string.chat_history_settings,
                        Icons.Default.History
                )
        object Packages : NavItem("packages", R.string.nav_packages, Icons.Default.Extension)
        object MemoryBase :
                NavItem("memory_base", R.string.nav_memory_base, Icons.Default.History)
        object Terminal : NavItem("terminal", R.string.terminal, Icons.Default.Terminal)
        object Toolbox : NavItem("toolbox", R.string.toolbox, Icons.Default.Apps)
        object About : NavItem("about", R.string.nav_about, Icons.Default.Info)
        object Agreement :
                NavItem("agreement", R.string.nav_item_agreement, Icons.Default.Description)
        object Help : NavItem("help", R.string.nav_help, Icons.AutoMirrored.Filled.Help)
        object TokenConfig : NavItem("token_config", R.string.token_config, Icons.Default.Token)
        object Workflow : NavItem("workflow", R.string.nav_workflow, Icons.Default.AccountTree)
        // 网文写作模块
        object NovelWorks : NavItem("novel_works", R.string.nav_novel_works, Icons.Default.Book)
        object NovelEditor : NavItem("novel_editor", R.string.nav_novel_editor, Icons.Default.Edit)
        object NovelMaterials : NavItem("novel_materials", R.string.nav_novel_materials, Icons.Default.FolderSpecial)
        object NovelOutline : NavItem("novel_outline", R.string.nav_novel_outline, Icons.Default.List)
        object NovelStats : NavItem("novel_stats", R.string.nav_novel_stats, Icons.Default.BarChart)
        object NovelTools : NavItem("novel_tools", R.string.nav_novel_tools, Icons.Default.AutoFixHigh)
        object NovelWorkspace : NavItem("novel_workspace", R.string.nav_novel_workspace, Icons.Default.Workspaces)
}
