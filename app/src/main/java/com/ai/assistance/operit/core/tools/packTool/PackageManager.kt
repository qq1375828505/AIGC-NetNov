package com.ai.assistance.operit.core.tools.packTool

/**
 * Stub implementation of PackageManager.
 * This is a placeholder to allow compilation without the actual implementation.
 */
object PackageManager {
    
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
    
    fun getPackageTools(packageName: String): List<String> = emptyList()
    
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
    
    fun runToolPkgMainHook(packageName: String, hookName: String, vararg args: Any?): Any? = null
    
    fun cancelToolPkgExecutionsForChat(chatId: String) {}
    
    fun getUiModuleId(packageName: String): String = ""
    
    fun getRenderRouteId(packageName: String): String = ""
    
    fun addToolPkgRuntimeChangeListener(listener: ToolPkgRuntimeChangeListener) {}
    
    fun removeToolPkgRuntimeChangeListener(listener: ToolPkgRuntimeChangeListener) {}
}
