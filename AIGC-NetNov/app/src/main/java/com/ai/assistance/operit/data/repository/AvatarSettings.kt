package com.ai.assistance.operit.data.repository

import kotlinx.parcelize.Parcelize
import android.os.Parcelable

/**
 * Stub implementation of AvatarSettings.
 * This is a placeholder to allow compilation without the actual implementation.
 * TODO: Replace with actual implementation
 */

@Parcelize
data class AvatarSettings(
    val isVoiceCallAvatarEnabled: Boolean = false,
    val defaultAvatarId: String = "",
    val enableAnimations: Boolean = true,
    val enableSounds: Boolean = false
) : Parcelable {
    // Stub implementation - all properties have default values
}
