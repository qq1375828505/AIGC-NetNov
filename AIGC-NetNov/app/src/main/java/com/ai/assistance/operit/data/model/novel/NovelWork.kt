package com.ai.assistance.operit.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_works")
data class NovelWork(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val title: String,
    val genre: String = "",
    val description: String = "",
    val status: String = "ongoing",       // ongoing / completed / paused
    val targetWordCount: Int = 0,
    val currentWordCount: Int = 0,
    val chapterCount: Int = 0,
    val coverPath: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
