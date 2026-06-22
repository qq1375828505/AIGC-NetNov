package com.ai.assistance.operit.core.tools.agent

data class StepResult(
    val step: Int,
    val success: Boolean,
    val result: String
)
