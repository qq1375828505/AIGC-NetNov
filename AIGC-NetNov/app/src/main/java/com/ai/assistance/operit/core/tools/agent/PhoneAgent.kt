package com.ai.assistance.operit.core.tools.agent

import android.content.Context
import kotlinx.coroutines.flow.Flow

/**
 * Stub implementation of PhoneAgent.
 * This is a placeholder to allow compilation without the actual implementation.
 */
class PhoneAgent(
    private val context: Context,
    private val config: AgentConfig = AgentConfig(),
    private val uiService: Any? = null,
    private val actionHandler: ActionHandler? = null,
    private val agentId: String = "",
    private val cleanupOnFinish: Boolean = false
) {
    suspend fun run(
        task: String,
        systemPrompt: String,
        onStep: (StepResult) -> Unit,
        isPausedFlow: Flow<Boolean>? = null
    ): String {
        return "PhoneAgent stub - not implemented"
    }
    
    fun startAgent() {}
    
    fun stopAgent() {}
    
    fun isRunning(): Boolean = false
    
    fun executeCommand(command: String): String = ""
}
