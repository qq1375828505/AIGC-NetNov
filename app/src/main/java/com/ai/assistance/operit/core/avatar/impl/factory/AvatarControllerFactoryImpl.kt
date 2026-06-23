package com.ai.assistance.operit.core.avatar.impl.factory

import androidx.compose.runtime.Composable
import com.ai.assistance.operit.core.avatar.common.control.AvatarController
import com.ai.assistance.operit.core.avatar.common.model.AvatarModel
import com.ai.assistance.operit.core.avatar.common.model.AvatarType

/**
 * Stub implementation of AvatarControllerFactoryImpl.
 * This is a placeholder to allow compilation without the actual implementation.
 * TODO: Replace with actual implementation
 */
object AvatarControllerFactoryImpl {
    @Composable
    fun createController(model: AvatarModel): AvatarController? {
        // Stub implementation - returns null
        return null
    }
    
    fun canCreateController(model: AvatarModel): Boolean {
        return false
    }
    
    fun supportedTypes(): List<AvatarType> {
        return emptyList()
    }
}
