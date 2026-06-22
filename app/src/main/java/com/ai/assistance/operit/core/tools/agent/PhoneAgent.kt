package com.ai.assistance.operit.core.tools.agent

/**
 * Stub implementation of PhoneAgent.
 * This is a placeholder to allow compilation without the actual implementation.
 */
object PhoneAgent {
    
    fun startAgent() {}
    
    fun stopAgent() {}
    
    fun isRunning(): Boolean = false
    
    fun executeCommand(command: String): String = ""
}

object PhoneAgentJobRegistry {
    
    fun registerJob(jobId: String, job: Any) {}
    
    fun unregisterJob(jobId: String) {}
    
    fun getJob(jobId: String): Any? = null
}
