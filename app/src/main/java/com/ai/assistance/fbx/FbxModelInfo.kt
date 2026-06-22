package com.ai.assistance.fbx

/**
 * Stub data class for FbxModelInfo.
 * This is a placeholder to allow compilation without the actual FBX native library.
 * The real implementation is in the :fbx module.
 */
data class FbxModelInfo(
    val animationNames: List<String> = emptyList(),
    val durationMillisByName: Map<String, Long> = emptyMap(),
    val hasSkeleton: Boolean = false,
    val hasAnimations: Boolean = false,
    val vertexCount: Int = 0,
    val faceCount: Int = 0
)
