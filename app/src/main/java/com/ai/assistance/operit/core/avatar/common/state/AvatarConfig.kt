package com.ai.assistance.operit.core.avatar.common.state

import com.ai.assistance.operit.core.avatar.common.model.AvatarType

/**
 * Stub implementation of AvatarConfig.
 * This is a placeholder to allow compilation without the actual implementation.
 * TODO: Replace with actual implementation
 */
data class AvatarConfig(
    val id: String = "",
    val name: String = "",
    val avatarType: AvatarType = AvatarType.NONE,
    val scale: Float = 1.0f,
    val translateX: Float = 0.0f,
    val translateY: Float = 0.0f,
    val type: String = "default",
    val customSettings: Map<String, Any> = emptyMap()
) {
    override fun toString(): String {
        return "AvatarConfig(id=$id, name=$name, type=$type, scale=$scale, translateX=$translateX, translateY=$translateY)"
    }
}
