package com.ai.assistance.operit.ui.features.settings.sections

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.ai.assistance.operit.data.model.ModelConfigData

@Composable
fun ModelApiSettingsSection(
    modifier: Modifier = Modifier,
    modelConfig: ModelConfigData? = null,
    onModelConfigChange: (ModelConfigData) -> Unit = {},
    config: ModelConfigData? = null,
    configManager: Any? = null,
    saveCoordinator: Any? = null,
    showNotification: (String) -> Unit = {},
    navigateToMnnModelDownload: () -> Unit = {}
) {
    // Stub implementation - empty composable
}
