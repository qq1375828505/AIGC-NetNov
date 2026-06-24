package com.ai.assistance.operit.core.tools.agent

data class AgentAction(
    val actionName: String? = null,
    val metadata: String = "",
    val fields: Map<String, String> = emptyMap()
)
