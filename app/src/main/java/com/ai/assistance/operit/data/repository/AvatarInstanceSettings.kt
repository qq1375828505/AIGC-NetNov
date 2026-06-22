package com.ai.assistance.operit.data.repository

import kotlinx.parcelize.Parcelize
import android.os.Parcelable

/**
 * Stub implementation of AvatarInstanceSettings.
 * This is a placeholder to allow compilation without the actual implementation.
 * TODO: Replace with actual implementation
 */

@Parcelize
data class AvatarInstanceSettings(
    val scale: Float = 1.0f,
    val translateX: Float = 0f,
    val translateY: Float = 0f,
    val customSettings: Map<String, Any?> = emptyMap()
) : Parcelable {
    // Stub implementation - all properties have default values
}
