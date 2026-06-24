package com.ai.assistance.operit.ui.features.settings.sections

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color

@Composable
fun SettingsInfoBanner(
    message: String,
    modifier: Modifier = Modifier,
    type: InfoBannerType = InfoBannerType.INFO
) {
    // Stub implementation - empty composable
}

@Composable
fun SettingsInfoBanner(
    text: String,
    backgroundColor: Color,
    modifier: Modifier = Modifier
) {
    // Stub implementation - empty composable
}

enum class InfoBannerType {
    INFO,
    WARNING,
    ERROR
}
