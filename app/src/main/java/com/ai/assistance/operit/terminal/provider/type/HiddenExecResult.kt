package com.ai.assistance.operit.terminal.provider.type

/**
 * Stub for HiddenExecResult.
 */
data class HiddenExecResult(
    val output: String = "",
    val exitCode: Int = 0,
    val isError: Boolean = false,
    val isTimeout: Boolean = false
)
