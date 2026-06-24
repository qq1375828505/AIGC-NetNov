package com.ai.assistance.operit.core.avatar.impl.factory

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.ai.assistance.operit.core.avatar.common.control.AvatarController
import com.ai.assistance.operit.core.avatar.common.factory.AvatarRendererFactory
import com.ai.assistance.operit.core.avatar.common.model.AvatarModel

class AvatarRendererFactoryImpl : AvatarRendererFactory {
    @Composable
    override fun createRenderer(model: AvatarModel): (@Composable (modifier: Modifier, controller: AvatarController) -> Unit)? {
        return null
    }

    fun getSupportedRenderModes(): List<String> {
        return emptyList()
    }
}
