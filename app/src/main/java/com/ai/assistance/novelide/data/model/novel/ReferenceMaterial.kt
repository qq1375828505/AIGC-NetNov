package com.ai.assistance.novelide.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_references")
data class ReferenceMaterial(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val title: String,
    val type: String = "",
    val content: String = "",
    val url: String = "",
    val source: String = "",
    val notes: String = "",
    val tags: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
