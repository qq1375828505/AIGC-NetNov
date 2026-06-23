package com.ai.assistance.operit.ui.main.screens

import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import com.ai.assistance.operit.ui.common.NavItem

sealed class Screen {
    @StringRes
    open val titleRes: Int? = null
    
    open val navItem: NavItem? = null
    
    open val participatesInCrossfadeTransition: Boolean = false
    
    open val stableScreenKey: String = ""
    
    open val keepAlive: Boolean = false
    
    open val title: String = ""
    
    open val containerPackageName: String = ""
    
    open val uiModuleId: String = ""
    
    fun resolvedStableScreenKey(): String? = stableScreenKey.ifBlank { null }
    
    @Composable
    open fun Content(
        navController: NavHostController,
        navigateTo: (Screen) -> Unit = {},
        onGoBack: () -> Unit = {},
        hasBackgroundImage: Boolean = false,
        onLoading: (Boolean) -> Unit = {},
        onError: (String) -> Unit = {},
        onGestureConsumed: (Boolean) -> Unit = {}
    ) {}
    
    object AiChat : Screen()
    object AssistantConfig : Screen()
    object MemoryBase : Screen()
    object Packages : Screen()
    object ShizukuCommands : Screen()
    object Workflow : Screen()
    object Settings : Screen()
    object Help : Screen()
    object About : Screen()
    object ToolTester : Screen()
    object FileManager : Screen()
    object TextToSpeech : Screen()
    object SpeechToText : Screen()
    object AppPermissions : Screen()
    object Agreement : Screen()
    object DefaultAssistantGuide : Screen()
    object Terminal : Screen()
    object UIDebugger : Screen()
    object FFmpegToolbox : Screen()
    object ShellExecutor : Screen()
    object Logcat : Screen()
    object SqlViewer : Screen()
    object TokenConfig : Screen()
    object ProcessLimitRemover : Screen()
    object HtmlPackager : Screen()
    object AutoGlmOneClick : Screen()
    object AutoGlmTool : Screen()
    object Toolbox : Screen()
    object ToolPermission : Screen()
    object UserPreferencesGuide : Screen()
    object UserPreferencesSettings : Screen()
    object ChatHistorySettings : Screen()
    object TerminalSetup : Screen()
    
    class ToolPkgComposeDsl(
        override val containerPackageName: String = "",
        override val uiModuleId: String = "",
        override val title: String = "",
        override val keepAlive: Boolean = false
    ) : Screen()
    
    class ToolPkgPluginConfig(
        override val containerPackageName: String = "",
        override val uiModuleId: String = "",
        override val title: String = "",
        override val keepAlive: Boolean = false
    ) : Screen()
    
    open fun getTitle(): String = title
}
