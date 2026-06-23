package com.ai.assistance.operit.data.repository

import com.ai.assistance.operit.core.avatar.common.model.AvatarType
import com.ai.assistance.operit.core.avatar.common.state.AvatarCustomMoodDefinition
import com.ai.assistance.operit.core.avatar.common.state.AvatarEmotion

data class AvatarConfig(
    val id: String = "",
    val name: String = "",
    val avatarType: AvatarType = AvatarType.NONE,
    val scale: Float = 1.0f,
    val translateX: Float = 0.0f,
    val translateY: Float = 0.0f,
    val type: String = "default",
    val customSettings: Map<String, Any> = emptyMap(),
    val emotionAnimationMapping: Map<AvatarEmotion, String> = emptyMap(),
    val moodAnimationMapping: Map<String, String> = emptyMap(),
    val customMoodDefinitions: List<AvatarCustomMoodDefinition> = emptyList()
) {
    override fun toString(): String {
        return "AvatarConfig(id=$id, name=$name, type=$type, scale=$scale, translateX=$translateX, translateY=$translateY)"
    }
}

fun AvatarConfig.getEmotionAnimationMapping(): Map<AvatarEmotion, String> = emotionAnimationMapping

fun AvatarConfig.getMoodAnimationMapping(): Map<String, String> = moodAnimationMapping

fun AvatarConfig.getCustomMoodDefinitions(): List<AvatarCustomMoodDefinition> = customMoodDefinitions
