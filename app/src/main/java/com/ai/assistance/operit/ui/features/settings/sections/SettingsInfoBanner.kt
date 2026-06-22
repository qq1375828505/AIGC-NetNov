package com.ai.assistance.operit.ui.features.settings.sections

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * Stub implementation of SettingsInfoBanner.
 * This is a placeholder to allow compilation without the actual implementation.
 * TODO: Replace with actual implementation
 */

@Composable
fun SettingsInfoBanner(
    message: String,
    modifier: Modifier = Modifier,
    type: InfoBannerType = InfoBannerType.INFO
) {
    // Stub implementation - empty composable
}

/**
 * Info banner type enum for SettingsInfoBanner
 */
enum class InfoBannerType {
    INFO,
    WARNING,
    ERROR
}
