package com.ai.assistance.operit.core.avatar.common.repository

import com.ai.assistance.operit.core.avatar.common.model.AvatarType
import com.ai.assistance.operit.core.avatar.common.state.AvatarConfig
import com.ai.assistance.operit.core.avatar.common.state.AvatarEmotion

/**
 * Stub implementation of AvatarRepository.
 * This is a placeholder to allow compilation without the actual implementation.
 * TODO: Replace with actual implementation
 */
class AvatarRepository {
    // Stub methods for avatar configuration
    fun getAvatarConfig(avatarType: AvatarType): AvatarConfig? = null

    fun saveAvatarConfig(avatarType: AvatarType, config: AvatarConfig): Boolean = false

    fun getAllAvatarConfigs(): Map<AvatarType, AvatarConfig> = emptyMap()

    fun deleteAvatarConfig(avatarType: AvatarType): Boolean = false

    fun resetToDefaults(): Boolean = false

    fun getCustomMoodDefinitions(): List<AvatarCustomMoodDefinition> = emptyList()

    fun getEmotionAnimationMapping(): Map<AvatarEmotion, String> = emptyMap()

    fun getMoodAnimationMapping(): Map<String, String> = emptyMap()

    companion object {
        @Volatile
        private var INSTANCE: AvatarRepository? = null

        fun getInstance(): AvatarRepository {
            return INSTANCE ?: synchronized(this) {
                val instance = AvatarRepository()
                INSTANCE = instance
                instance
            }
        }
    }
}

data class AvatarCustomMoodDefinition(
    val id: String = "",
    val name: String = "",
    val animationKey: String = "",
    val customSettings: Map<String, Any?> = emptyMap()
)
