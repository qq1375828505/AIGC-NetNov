package com.ai.assistance.operit.terminal.data

/**
 * Stub for TerminalState.
 */
data class TerminalState(
    val isRunning: Boolean = false,
    val currentSessionId: String = "",
    val sessions: List<com.ai.assistance.operit.terminal.TerminalSession> = emptyList()
)
