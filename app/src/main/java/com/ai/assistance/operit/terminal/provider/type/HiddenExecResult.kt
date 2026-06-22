package com.ai.assistance.operit.terminal.provider.type

/**
 * Stub for HiddenExecResult.
 */
data class HiddenExecResult(
    val output: String = "",
    val exitCode: Int = 0,
    val isError: Boolean = false,
    val isTimeout: Boolean = false,
    val error: String = "",
    val state: State = State.UNKNOWN,
    val rawOutputPreview: String = ""
) {
    /**
     * 检查是否成功
     */
    val isOk: Boolean
        get() = !isError && exitCode == 0
    
    /**
     * 状态枚举
     */
    enum class State {
        UNKNOWN,
        SUCCESS,
        ERROR,
        TIMEOUT
    }
}
