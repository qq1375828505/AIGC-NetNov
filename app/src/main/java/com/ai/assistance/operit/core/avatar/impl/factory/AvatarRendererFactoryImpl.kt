package com.ai.assistance.operit.core.avatar.impl.factory

import androidx.compose.runtime.Composable
import com.ai.assistance.operit.core.avatar.common.model.AvatarModel
import com.ai.assistance.operit.core.avatar.common.render.AvatarRenderer

/**
 * Stub implementation of AvatarRendererFactoryImpl.
 * This is a placeholder to allow compilation without the actual implementation.
 * TODO: Replace with actual implementation
 */
object AvatarRendererFactoryImpl {
    @Composable
    fun createRenderer(model: AvatarModel): (@Composable () -> Unit)? {
        // Stub implementation - returns null
        return null
    }
    
    fun getSupportedRenderModes(): List<String> {
        return emptyList()
    }
}
