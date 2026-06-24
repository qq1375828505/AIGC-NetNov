package com.ai.assistance.operit.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_todos")
data class WritingTodo(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val content: String,
    val isCompleted: Boolean = false,
    val priority: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
