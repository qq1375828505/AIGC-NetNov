package com.ai.assistance.operit.core.avatar.impl.factory

import com.ai.assistance.operit.core.avatar.common.factory.AvatarModelFactory
import com.ai.assistance.operit.core.avatar.common.model.AvatarModel
import com.ai.assistance.operit.core.avatar.common.model.AvatarType

class AvatarModelFactoryImpl : AvatarModelFactory {
    override fun createModel(id: String, name: String, type: AvatarType, data: Map<String, Any>): AvatarModel? {
        return null
    }

    override fun createModelFromData(dataModel: Any): AvatarModel? {
        return null
    }

    override fun createDefaultModel(type: AvatarType, baseName: String): AvatarModel? {
        return null
    }

    override fun validateData(type: AvatarType, data: Map<String, Any>): Boolean {
        return false
    }

    override val supportedTypes: List<AvatarType> = emptyList()

    override fun getRequiredDataKeys(type: AvatarType): List<String> = emptyList()
}
