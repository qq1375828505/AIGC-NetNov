package com.ai.assistance.operit.core.avatar.impl.factory

import com.ai.assistance.operit.core.avatar.common.control.AvatarController
import com.ai.assistance.operit.core.avatar.common.model.AvatarModel
import com.ai.assistance.operit.core.avatar.common.model.AvatarType

/**
 * Stub implementation of AvatarControllerFactoryImpl.
 * This is a placeholder to allow compilation without the actual implementation.
 * TODO: Replace with actual implementation
 */
object AvatarControllerFactoryImpl {
    fun createController(avatarType: AvatarType, model: AvatarModel): AvatarController? {
        // Stub implementation - returns null
        return null
    }
    
    fun getSupportedTypes(): List<AvatarType> {
        return emptyList()
    }
}
