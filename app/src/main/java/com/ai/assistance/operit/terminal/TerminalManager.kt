package com.ai.assistance.operit.terminal

import android.content.Context
import com.ai.assistance.operit.terminal.data.TerminalState
import com.ai.assistance.operit.terminal.provider.type.HiddenExecResult
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Stub for TerminalManager.
 */
class TerminalManager private constructor(private val context: Context) {

    companion object {
        @Volatile
        private var INSTANCE: TerminalManager? = null

        fun getInstance(context: Context): TerminalManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: TerminalManager(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    val commandExecutionEvents: MutableSharedFlow<CommandExecutionEvent> = MutableSharedFlow()
    val directoryChangeEvents: MutableSharedFlow<SessionDirectoryEvent> = MutableSharedFlow()
    val terminalState: MutableStateFlow<TerminalState> = MutableStateFlow(TerminalState())
    val sessions: List<String> = emptyList()
    val currentSessionId: String = ""
    val currentDirectory: String = ""
    val isInteractiveMode: Boolean = false
    val interactivePrompt: String = ""

    suspend fun initializeEnvironment(): Boolean = true

    fun cleanup() {}

    suspend fun createNewSession(title: String? = null): TerminalSession = TerminalSession()

    fun switchToSession(sessionId: String) {}

    fun closeSession(sessionId: String) {}

    fun sendCommandToSession(sessionId: String, command: String, commandId: String) {}

    fun sendInput(input: String) {}

    fun sendInterruptSignal() {}

    suspend fun executeHiddenCommand(
        command: String,
        executorKey: String = "default",
        timeoutMs: Long = 120000L
    ): HiddenExecResult = HiddenExecResult()
}

data class TerminalSession(
    val id: String = java.util.UUID.randomUUID().toString()
)
