package com.ai.assistance.operit.util

import com.ai.assistance.operit.util.AppLogger

/**
 * Utility class for FFmpeg operations
 *
 * NOTE: ffmpeg-kit dependency has been removed (media processing module cut).
 * All methods are stubs that return failure/null.
 */
object FFmpegUtil {
    private const val TAG = "FFmpegUtil"
    private const val STUB_MSG = "媒体处理功能已裁剪"

    /**
     * Build a scale filter string that survives FFmpegKit argument parsing.
     * FFmpeg expressions need an escaped comma when passed without a shell.
     */
    fun scaleFilterMaxWidth(maxWidth: Int): String = "scale=min(${maxWidth}\\,iw):-2"

    /**
     * Execute an FFmpeg command and return if it was successful.
     * Stub: always returns false (media processing module cut).
     */
    fun executeCommand(command: String): Boolean {
        AppLogger.w(TAG, "$STUB_MSG: executeCommand called with: $command")
        return false
    }

    /**
     * Get media information for a file.
     * Stub: always returns null (media processing module cut).
     */
    fun getMediaInfo(filePath: String): com.ai.assistance.operit.core.tools.ToolResultDataClasses.MediaInfo? {
        AppLogger.w(TAG, "$STUB_MSG: getMediaInfo called for: $filePath")
        return null
    }
}
