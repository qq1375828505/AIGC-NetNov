package com.ai.assistance.novelide.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_characters")
data class NovelCharacter(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val name: String,
    val gender: String = "",
    val age: String = "",
    val role: String = "",               // 主角/配角/龙套
    val appearance: String = "",
    val personality: String = "",
    val background: String = "",
    val notes: String = "",
    val tags: String = "",               // JSON 数组
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
