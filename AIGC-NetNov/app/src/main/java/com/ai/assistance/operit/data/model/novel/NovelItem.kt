package com.ai.assistance.operit.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_items")
data class NovelItem(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val name: String,
    val grade: String = "",
    val holder: String = "",
    val isKey: Boolean = false,
    val description: String = "",
    val tags: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
