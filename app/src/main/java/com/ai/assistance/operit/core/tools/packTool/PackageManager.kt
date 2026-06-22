package com.ai.assistance.operit.core.tools.packTool

import com.ai.assistance.operit.core.tools.PackageTool
import com.ai.assistance.operit.core.tools.javascript.JsEngine

data class LocalizedText(val values: Map<String, String> = emptyMap()) {
    fun resolve(preferredLanguage: String): String {
        return values[preferredLanguage] ?: values.values.firstOrNull() ?: ""
    }
    
    override fun toString(): String {
        return values.values.firstOrNull() ?: ""
    }
}

data class ToolPackage(
    val name: String = "",
    val description: LocalizedText = LocalizedText(),
    val tools: List<PackageTool> = emptyList()
)

/**
 * Stub implementation of PackageManager.
 * This is a placeholder to allow compilation without the actual implementation.
 */
class PackageManager private constructor(
    context: android.content.Context,
    toolHandler: com.ai.assistance.operit.core.tools.AIToolHandler
) {
    private val appContext: android.content.Context = context.applicationContext
    
    companion object {
        @Volatile
        private var INSTANCE: PackageManager? = null
        
        fun getInstance(context: android.content.Context, toolHandler: com.ai.assistance.operit.core.tools.AIToolHandler): PackageManager {
            return INSTANCE ?: synchronized(this) {
                val instance = PackageManager(context, toolHandler)
                INSTANCE = instance
                instance
            }
        }
    }
    
    // Nested data classes for package management
    data class ToolPkgContainerDetails(
        val name: String = "",
        val description: LocalizedText = LocalizedText(),
        val packageName: String = "",
        val version: String = "",
        val displayName: LocalizedText = LocalizedText(),
        val isBuiltIn: Boolean = false,
        val enabledByDefault: Boolean = false,
        val tools: List<PackageTool> = emptyList()
    )
    
    data class PackageLoadErrorInfo(
        val packageName: String = "",
        val errorMessage: String = "",
        val filePath: String = ""
    )
    
    data class ToolPkgWorkflowTemplate(
        val id: String = "",
        val name: String = "",
        val description: String = ""
    )
    
    data class ToolPkgWorkspaceTemplate(
        val id: String = "",
        val name: String = "",
        val description: String = ""
    )
    
    data class ToolPkgToolboxUiModule(
        val id: String = "",
        val name: String = "",
        val description: String = ""
    )
    
    data class ToolPkgDesktopWidget(
        val id: String = "",
        val name: String = "",
        val description: String = "",
        val containerPackageName: String = "",
        val toolPkgId: String = "",
        val widgetId: String = "",
        val routeId: String = "",
        val renderRouteId: String = "",
        val title: String = "",
        val subtitle: String = "",
        val icon: String? = null,
        val order: Int = 0
    )
    
    data class ToolPkgUiRoute(
        val containerPackageName: String = "",
        val toolPkgId: String = "",
        val routeId: String = "",
        val uiModuleId: String = "",
        val runtime: String = "",
        val screen: String = "",
        val title: String = "",
        val description: String = "",
        val keepAlive: Boolean = false,
        val moduleSpec: Map<String, Any?> = emptyMap()
    )
    
    data class ToolPkgNavigationEntry(
        val containerPackageName: String = "",
        val toolPkgId: String = "",
        val entryId: String = "",
        val routeId: String = "",
        val surface: String = "",
        val title: String = "",
        val description: String = "",
        val icon: String? = null,
        val action: Map<String, Any?> = emptyMap()
    )
    
    fun interface ToolPkgRuntimeChangeListener {
        fun onContainersChanged(activeContainers: List<ToolPkgContainerRuntime>)
    }
    
    data class ToolPkgContainerRuntime(
        val packageName: String = "",
        val isActive: Boolean = false
    )
    
    // Package management methods
    fun getEnabledPackageNames(): List<String> = emptyList()
    
    fun getEnabledPackageNameSetInternal(): Set<String> = emptySet()
    
    fun getAvailablePackages(): Map<String, ToolPkgContainerDetails> = emptyMap()
    
    fun getAvailableServerPackages(): List<ToolPkgContainerDetails> = emptyList()
    
    fun getPackageLoadErrors(): List<PackageLoadErrorInfo> = emptyList()
    
    fun getContainerDetails(packageName: String): ToolPkgContainerDetails? = null
    
    fun getAllContainerDetails(): Map<String, ToolPkgContainerDetails> = emptyMap()
    
    fun addPackageFileFromExternalStorage(filePath: String): String = ""
    
    fun enablePackage(packageName: String) {}
    
    fun disablePackage(packageName: String) {}
    
    fun isPackageEnabled(packageName: String): Boolean = false
    
    fun getPackageTools(packageName: String): ToolPackage? = null
    
    fun getEffectivePackageTools(packageName: String): ToolPackage? = null
    
    fun normalizePackageName(packageName: String): String = packageName
    
    fun exists(packageName: String): Boolean = false
    
    fun getToolPkgContainersInternal(): List<ToolPkgContainerDetails> = emptyList()
    
    fun getEnabledPackageNameSet(): Set<String> = emptySet()
    
    /**
     * 获取已禁用的包列表
     * @return List<String> 已禁用的包名列表
     */
    fun getDisabledPackages(): List<String> = emptyList()
    
    /**
     * 获取外部包路径
     * @return String 外部包路径
     */
    fun getExternalPackagesPath(): String = ""
    
    fun getDisplayName(packageName: String): String = ""
    
    fun getTitle(packageName: String): String = ""
    
    fun getDescription(packageName: String): String = ""
    
    fun getScreen(packageName: String): String = ""
    
    fun getOperationOverlay(packageName: String): String = ""
    
    fun getContainerPackageName(packageName: String): String = ""
    
    fun ensureInitialized() {}
    
    fun getCustomSettings(packageName: String): Map<String, Any> = emptyMap()
    
    fun runToolPkgMainHook(
        containerPackageName: String,
        functionName: String,
        event: String,
        eventName: String? = null,
        pluginId: String? = null,
        inlineFunctionSource: String? = null,
        eventPayload: Map<String, Any?> = emptyMap(),
        onIntermediateResult: ((Any?) -> Unit)? = null,
        executionContextKey: String? = null,
        runtimeKind: String? = null,
        dispatchIntermediateOnMain: Boolean = true
    ): Result<Any?> = Result.success(null)
    
    fun cancelToolPkgExecutionsForChat(chatId: String, reason: String = "") {}
    
    fun usePackage(packageName: String): String {
        return "Package usage not implemented in stub"
    }
    
    fun isToolPkgContainer(packageName: String): Boolean {
        return false
    }
    
    fun executeUsePackageTool(toolName: String, packageName: String): com.ai.assistance.operit.data.model.ToolResult {
        if (packageName.isBlank()) {
            return com.ai.assistance.operit.data.model.ToolResult(
                toolName = toolName,
                success = false,
                result = com.ai.assistance.operit.core.tools.StringResultData(""),
                error = "Missing required parameter: package_name"
            )
        }
        enablePackage(packageName)
        return com.ai.assistance.operit.data.model.ToolResult(
            toolName = toolName,
            success = true,
            result = com.ai.assistance.operit.core.tools.StringResultData("Package '$packageName' activated successfully")
        )
    }
    
    fun getUiModuleId(packageName: String): String = ""
    
    fun getRenderRouteId(packageName: String): String = ""
    
    fun addToolPkgRuntimeChangeListener(listener: ToolPkgRuntimeChangeListener) {}
    
    fun removeToolPkgRuntimeChangeListener(listener: ToolPkgRuntimeChangeListener) {}
    
    fun getToolPkgUiRoutes(
        runtime: String = "compose_dsl",
        resolveContext: android.content.Context? = null
    ): List<ToolPkgUiRoute> = emptyList()
    
    fun getToolPkgDesktopWidgets(
        resolveContext: android.content.Context? = null
    ): List<ToolPkgDesktopWidget> = emptyList()
    
    fun getToolPkgComposeDslScript(
        containerPackageName: String,
        uiModuleId: String? = null
    ): String? = null
    
    fun getToolPkgComposeDslScreenPath(
        containerPackageName: String,
        uiModuleId: String? = null
    ): String? = null
    
    fun getToolPkgExecutionEngine(contextKey: String): JsEngine {
        return JsEngine(appContext)
    }
    
    fun releaseToolPkgExecutionEngine(contextKey: String) {}
    
    fun getToolPkgNavigationEntries(
        runtime: String = "compose_dsl",
        resolveContext: android.content.Context? = null
    ): List<ToolPkgNavigationEntry> = emptyList()
    
    fun runToolPkgNavigationEntryAction(
        containerPackageName: String,
        entryId: String,
        functionName: String,
        inlineFunctionSource: String? = null,
        eventPayload: Map<String, Any?> = emptyMap(),
        onIntermediateResult: ((Any?) -> Unit)? = null
    ): Result<Any?> = Result.success(null)
    
    fun readToolPkgTextResource(
        packageNameOrSubpackageId: String,
        resourcePath: String
    ): String? = null
    
    fun getToolPkgWorkflowTemplates(
        context: android.content.Context
    ): List<ToolPkgWorkflowTemplate> = emptyList()
    
    fun importToolPkgWorkflowTemplate(
        containerPackageName: String,
        templateId: String
    ): Result<Any?> = Result.success(null)
    
    fun getEnabledToolPkgContainerRuntimes(): List<ToolPkgContainerRuntime> = emptyList()
}
