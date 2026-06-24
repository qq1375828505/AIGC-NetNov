package com.ai.assistance.novelide.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_custom_material_items")
data class CustomMaterialItem(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val folderId: String,
    val title: String,
    val content: String = "",
    val orderIndex: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
