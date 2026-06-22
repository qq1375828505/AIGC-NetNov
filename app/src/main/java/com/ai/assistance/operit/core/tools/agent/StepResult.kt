package com.ai.assistance.operit.core.tools.agent

data class StepResult(
    val step: Int,
    val success: Boolean,
    val result: String,
    val thinking: String? = null,
    val action: Any? = null,
    val message: String? = null
)
