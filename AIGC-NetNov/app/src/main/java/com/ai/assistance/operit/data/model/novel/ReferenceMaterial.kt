package com.ai.assistance.operit.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_references")
data class ReferenceMaterial(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val title: String,
    val content: String = "",
    val source: String = "",
    val tags: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
