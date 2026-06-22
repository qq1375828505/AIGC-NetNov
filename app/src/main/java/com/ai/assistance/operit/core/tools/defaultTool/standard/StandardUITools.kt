package com.ai.assistance.operit.core.tools.defaultTool.standard

import android.content.Context
import com.ai.assistance.operit.core.tools.StringResultData
import com.ai.assistance.operit.core.tools.agent.ToolImplementations
import com.ai.assistance.operit.data.model.AITool
import com.ai.assistance.operit.data.model.ToolResult

/**
 * Stub implementation of StandardUITools.
 * This is a placeholder to allow compilation without the actual implementation.
 */
open class StandardUITools(protected val context: Context) : ToolImplementations {
    
    fun getAvailableTools(): List<String> = emptyList()
    
    fun executeTool(toolName: String, params: Map<String, Any>): Any? = null
    
    fun isToolAvailable(toolName: String): Boolean = false
    
    open suspend fun getPageInfo(tool: AITool): ToolResult {
        return ToolResult(tool.toolName, false, StringResultData("Not implemented in stub"))
    }
    
    open suspend fun clickElement(tool: AITool): ToolResult {
        return ToolResult(tool.toolName, false, StringResultData("Not implemented in stub"))
    }
    
    open suspend fun runUiSubAgent(tool: AITool): ToolResult {
        return ToolResult(tool.toolName, false, StringResultData("Not implemented in stub"))
    }
    
    protected open suspend fun captureScreenshotToFile(tool: AITool): Pair<String?, Pair<Int, Int>?> {
        return Pair(null, null)
    }
    
    override suspend fun tap(tool: AITool): ToolResult {
        return ToolResult(tool.toolName, false, StringResultData("Not implemented in stub"))
    }
    
    override suspend fun longPress(tool: AITool): ToolResult {
        return ToolResult(tool.toolName, false, StringResultData("Not implemented in stub"))
    }
    
    override suspend fun setInputText(tool: AITool): ToolResult {
        return ToolResult(tool.toolName, false, StringResultData("Not implemented in stub"))
    }
    
    override suspend fun swipe(tool: AITool): ToolResult {
        return ToolResult(tool.toolName, false, StringResultData("Not implemented in stub"))
    }
    
    override suspend fun pressKey(tool: AITool): ToolResult {
        return ToolResult(tool.toolName, false, StringResultData("Not implemented in stub"))
    }
    
    override suspend fun captureScreenshot(tool: AITool): Pair<String?, Pair<Int, Int>?> {
        return Pair(null, null)
    }
}
