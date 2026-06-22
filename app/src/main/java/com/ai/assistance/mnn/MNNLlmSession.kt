package com.ai.assistance.mnn

/**
 * Stub class for MNNLlmSession.
 * This is a placeholder to allow compilation without the actual MNN native library.
 * The real implementation is in the :mnn module.
 */
class MNNLlmSession private constructor(
    private var llmPtr: Long,
    private val modelPath: String
) {
    companion object {
        private const val TAG = "MNNLlmSession"

        @JvmStatic
        fun create(
            modelDir: String,
            backendType: String = "cpu",
            threadNum: Int = 4,
            precision: String = "low",
            memory: String = "low",
            tmpPath: String? = null
        ): MNNLlmSession? = null
    }

    fun cancel() {
        // Stub: no-op
    }

    fun release() {
        // Stub: no-op
    }

    fun countTokens(text: String): Int = 0

    fun countTokensWithHistory(history: List<String>): Int = 0

    fun generateResponse(prompt: String, maxTokens: Int = -1): String = ""

    fun generateStreamResponse(prompt: String, maxTokens: Int = -1, callback: (String) -> Boolean): Boolean = false

    fun setBackendType(backendType: String) {
        // Stub: no-op
    }

    fun setThreadNum(threadNum: Int) {
        // Stub: no-op
    }

    fun setPrecision(precision: String) {
        // Stub: no-op
    }

    fun setMemory(memory: String) {
        // Stub: no-op
    }

    fun getMaxAllTokens(): Int = 0

    fun isVisualModel(): Boolean = false

    fun isAudioModel(): Boolean = false

    fun loadVisionImage(imagePath: String): Boolean = false

    fun loadAudioFile(audioPath: String): Boolean = false
}
