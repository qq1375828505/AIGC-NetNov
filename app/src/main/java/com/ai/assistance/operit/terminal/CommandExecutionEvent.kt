package com.ai.assistance.operit.terminal

/**
 * Stub for CommandExecutionEvent - represents a command execution event in the terminal.
 */
data class CommandExecutionEvent(
    val sessionId: String = "",
    val commandId: String = "",
    val outputChunk: String = "",
    val isCompleted: Boolean = false,
    val exitCode: Int = 0,
    val isError: Boolean = false
)
