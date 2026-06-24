package com.ai.assistance.operit.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_custom_material_folders")
data class CustomMaterialFolder(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val name: String,
    val icon: String = "",
    val orderIndex: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
