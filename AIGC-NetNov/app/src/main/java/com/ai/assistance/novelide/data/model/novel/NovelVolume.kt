package com.ai.assistance.novelide.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_volumes")
data class NovelVolume(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val title: String,
    val orderIndex: Int = 0,
    val summary: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
