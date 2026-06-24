package com.ai.assistance.operit.core.avatar.impl.factory

import androidx.compose.runtime.Composable
import com.ai.assistance.operit.core.avatar.common.control.AvatarController
import com.ai.assistance.operit.core.avatar.common.factory.AvatarControllerFactory
import com.ai.assistance.operit.core.avatar.common.model.AvatarModel

class AvatarControllerFactoryImpl : AvatarControllerFactory {
    @Composable
    override fun createController(model: AvatarModel): AvatarController? {
        return null
    }

    override fun canCreateController(model: AvatarModel): Boolean {
        return false
    }

    override val supportedTypes: List<String> = emptyList()
}
