package com.ai.assistance.operit.core.tools.packTool

import com.ai.assistance.operit.core.tools.PackageTool

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
class PackageManager private constructor(context: android.content.Context, toolHandler: com.ai.assistance.operit.core.tools.AIToolHandler) {
    
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
        val description: String = "",
        val packageName: String = "",
        val version: String = ""
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
        val description: String = ""
    )
    
    interface ToolPkgRuntimeChangeListener {
        fun onPackageLoaded(packageName: String) {}
        fun onPackageUnloaded(packageName: String) {}
    }
    
    // Package management methods
    fun getEnabledPackageNames(): List<String> = emptyList()
    
    fun getEnabledPackageNameSetInternal(): Set<String> = emptySet()
    
    fun getAvailablePackages(): List<ToolPkgContainerDetails> = emptyList()
    
    fun getAvailableServerPackages(): List<ToolPkgContainerDetails> = emptyList()
    
    fun getPackageLoadErrors(): List<PackageLoadErrorInfo> = emptyList()
    
    fun getContainerDetails(packageName: String): ToolPkgContainerDetails? = null
    
    fun getAllContainerDetails(): Map<String, ToolPkgContainerDetails> = emptyMap()
    
    fun addPackageFileFromExternalStorage(filePath: String): String = ""
    
    fun enablePackage(packageName: String) {}
    
    fun disablePackage(packageName: String) {}
    
    fun isPackageEnabled(packageName: String): Boolean = false
    
    fun getPackageTools(packageName: String): ToolPackage? = null
    
    fun normalizePackageName(packageName: String): String = packageName
    
    fun exists(packageName: String): Boolean = false
    
    fun getToolPkgContainersInternal(): List<ToolPkgContainerDetails> = emptyList()
    
    fun getEnabledPackageNameSet(): Set<String> = emptySet()
    
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
    
    fun getUiModuleId(packageName: String): String = ""
    
    fun getRenderRouteId(packageName: String): String = ""
    
    fun addToolPkgRuntimeChangeListener(listener: ToolPkgRuntimeChangeListener) {}
    
    fun removeToolPkgRuntimeChangeListener(listener: ToolPkgRuntimeChangeListener) {}
}
