package com.ai.assistance.operit.core.tools.defaultTool.standard

import android.content.Context
import com.ai.assistance.operit.core.tools.FFmpegResultData
import com.ai.assistance.operit.core.tools.StringResultData
import com.ai.assistance.operit.core.tools.ToolExecutor
import com.ai.assistance.operit.data.model.AITool
import com.ai.assistance.operit.data.model.ToolResult
import com.ai.assistance.operit.data.model.ToolValidationResult
import java.io.File

/**
 * NOTE: ffmpeg-kit dependency has been removed (media processing module cut).
 * All executor classes return error results indicating the feature is unavailable.
 */

private const val STUB_ERROR = "媒体处理功能已裁剪，FFmpeg 不可用"

/** FFmpeg工具执行器 提供媒体文件处理能力，包括转换、裁剪、合并等功能 */
class StandardFFmpegToolExecutor(private val context: Context) : ToolExecutor {
    companion object {
        private const val TAG = "FFmpegToolExecutor"
    }

    override fun invoke(tool: AITool): ToolResult {
        return ToolResult(
                toolName = tool.name,
                success = false,
                result = StringResultData(""),
                error = STUB_ERROR
        )
    }

    override fun validateParameters(tool: AITool): ToolValidationResult {
        val command = tool.parameters.find { it.name == "command" }?.value

        if (command.isNullOrEmpty()) {
            return ToolValidationResult(valid = false, errorMessage = "Must provide command parameter")
        }

        return ToolValidationResult(valid = true)
    }
}

/** FFmpeg信息工具执行器 获取有关系统FFmpeg配置的信息 */
class StandardFFmpegInfoToolExecutor : ToolExecutor {
    companion object {
        private const val TAG = "FFmpegInfoToolExecutor"
    }

    override fun invoke(tool: AITool): ToolResult {
        return ToolResult(
                toolName = tool.name,
                success = false,
                result = StringResultData(""),
                error = STUB_ERROR
        )
    }

    override fun validateParameters(tool: AITool): ToolValidationResult {
        // 不需要参数
        return ToolValidationResult(valid = true)
    }
}

/** FFmpeg转换视频工具执行器 提供一个简化的接口用于常见的视频转换操作 */
class StandardFFmpegConvertToolExecutor(private val context: Context) : ToolExecutor {
    companion object {
        private const val TAG = "FFmpegConvertToolExecutor"
    }

    override fun invoke(tool: AITool): ToolResult {
        return ToolResult(
                toolName = tool.name,
                success = false,
                result = StringResultData(""),
                error = STUB_ERROR
        )
    }

    override fun validateParameters(tool: AITool): ToolValidationResult {
        val inputPath = tool.parameters.find { it.name == "input_path" }?.value
        val outputPath = tool.parameters.find { it.name == "output_path" }?.value

        if (inputPath.isNullOrEmpty()) {
            return ToolValidationResult(valid = false, errorMessage = "Must provide input_path parameter")
        }

        if (outputPath.isNullOrEmpty()) {
            return ToolValidationResult(valid = false, errorMessage = "Must provide output_path parameter")
        }

        return ToolValidationResult(valid = true)
    }
}
