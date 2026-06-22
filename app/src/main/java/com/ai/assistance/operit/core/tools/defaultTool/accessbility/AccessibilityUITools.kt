package com.ai.assistance.operit.core.tools.defaultTool.accessbility

import android.content.Context
import android.graphics.Bitmap
import com.ai.assistance.operit.core.tools.StringResultData
import com.ai.assistance.operit.core.tools.defaultTool.standard.StandardUITools
import com.ai.assistance.operit.data.model.AITool
import com.ai.assistance.operit.data.model.ToolResult

/**
 * 无障碍级别的UI工具（简化实现）
 * 保留类定义和继承关系，所有方法都返回默认结果
 */
open class AccessibilityUITools(context: Context) : StandardUITools(context) {

    companion object {
        private const val TAG = "AccessibilityUITools"
    }

    /** Gets the current UI page/window information */
    override suspend fun getPageInfo(tool: AITool): ToolResult {
        return ToolResult(tool.name, false, StringResultData("Not available in this build"))
    }

    /** 点击元素 */
    override suspend fun clickElement(tool: AITool): ToolResult {
        return ToolResult(tool.name, false, StringResultData("Not available in this build"))
    }

    /** 设置输入文本 */
    override suspend fun setInputText(tool: AITool): ToolResult {
        return ToolResult(tool.name, false, StringResultData("Not available in this build"))
    }

    /** 执行轻触操作 */
    override suspend fun tap(tool: AITool): ToolResult {
        return ToolResult(tool.name, false, StringResultData("Not available in this build"))
    }

    /** 执行长按操作 */
    override suspend fun longPress(tool: AITool): ToolResult {
        return ToolResult(tool.name, false, StringResultData("Not available in this build"))
    }

    /** 执行滑动操作 */
    override suspend fun swipe(tool: AITool): ToolResult {
        return ToolResult(tool.name, false, StringResultData("Not available in this build"))
    }

    /** 模拟按键操作 */
    override suspend fun pressKey(tool: AITool): ToolResult {
        return ToolResult(tool.name, false, StringResultData("Not available in this build"))
    }

    /** 截图到文件 */
    override suspend fun captureScreenshotToFile(tool: AITool): Pair<String?, Pair<Int, Int>?> {
        return Pair(null, null)
    }

    /** 截图 */
    override suspend fun captureScreenshot(tool: AITool): Pair<String?, Pair<Int, Int>?> {
        return Pair(null, null)
    }

    /** 截图到Bitmap */
    override suspend fun captureScreenshotBitmap(tool: AITool): Pair<Bitmap?, Pair<Int, Int>?> {
        return Pair(null, null)
    }
}
