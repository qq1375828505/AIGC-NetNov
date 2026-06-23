package com.ai.assistance.operit.ui.main.screens

import androidx.annotation.StringRes
import com.ai.assistance.operit.ui.common.NavItem

/**
 * Stub implementation of Screen sealed class.
 * This is a placeholder to fix compilation errors.
 * TODO: Replace with actual implementation
 */
sealed class Screen {
    // Common properties for all screens
    @StringRes
    open val titleRes: Int? = null
    
    open val navItem: NavItem? = null
    
    open val participatesInCrossfadeTransition: Boolean = false
    
    open val stableScreenKey: String = ""
    
    // Screen subclasses
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
    
    // Helper method to get title
    open fun getTitle(): String = ""
}
