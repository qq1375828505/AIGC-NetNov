package com.ai.assistance.llama

/**
 * Stub class for LlamaSession.
 * This is a placeholder to allow compilation without the actual llama.cpp native library.
 * The real implementation is in the :llama module.
 */
class LlamaSession private constructor(
    private var sessionPtr: Long
) {
    data class Config(
        val nThreads: Int = 4,
        val nCtx: Int = 2048,
        val nBatch: Int = 512,
        val nUBatch: Int = 512,
        val nGpuLayers: Int = 0,
        val useMmap: Boolean = false,
        val flashAttention: Boolean = false,
        val kvUnified: Boolean = true,
        val offloadKqv: Boolean = false
    )

    companion object {
        @JvmStatic
        fun isAvailable(): Boolean = false

        @JvmStatic
        fun getUnavailableReason(): String = "llama.cpp native library not available (stub)"

        @JvmStatic
        fun create(pathModel: String, config: Config): LlamaSession? = null
    }

    fun cancel() {
        // Stub: no-op
    }

    fun release() {
        // Stub: no-op
    }

    fun applyStructuredChatTemplate(messagesJson: String, toolsJson: String, addGenerationPrompt: Boolean): String? = null

    fun applyChatTemplate(roles: List<String>, contents: List<String>, addGenerationPrompt: Boolean): String? = null

    fun countTokens(text: String): Int = 0

    fun setSamplingParams(
        temperature: Float = 1.0f,
        topP: Float = 1.0f,
        topK: Int = 0,
        repetitionPenalty: Float = 1.0f,
        frequencyPenalty: Float = 0.0f,
        presencePenalty: Float = 0.0f,
        penaltyLastN: Int = 64
    ) {
        // Stub: no-op
    }

    fun clearToolCallGrammar() {
        // Stub: no-op
    }

    fun generateStream(prompt: String, maxTokens: Int, callback: (String) -> Boolean): Boolean = false

    fun parseToolCallResponse(response: String): String? = null
}
