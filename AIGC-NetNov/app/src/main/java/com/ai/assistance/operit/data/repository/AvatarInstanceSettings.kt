package com.ai.assistance.operit.data.repository

import android.os.Parcelable
import kotlinx.parcelize.IgnoredOnParcel
import kotlinx.parcelize.Parcelize

@Parcelize
data class AvatarInstanceSettings(
    val scale: Float = 1.0f,
    val translateX: Float = 0f,
    val translateY: Float = 0f,
    val isVoiceCallAvatarEnabled: Boolean = false
) : Parcelable {
    @IgnoredOnParcel
    var customSettings: Map<String, Any> = emptyMap()

    fun copy(
        scale: Float = this.scale,
        translateX: Float = this.translateX,
        translateY: Float = this.translateY,
        isVoiceCallAvatarEnabled: Boolean = this.isVoiceCallAvatarEnabled,
        customSettings: Map<String, Any> = this.customSettings
    ): AvatarInstanceSettings {
        return AvatarInstanceSettings(scale, translateX, translateY, isVoiceCallAvatarEnabled).also {
            it.customSettings = customSettings
        }
    }
}
