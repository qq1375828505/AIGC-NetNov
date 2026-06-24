package com.ai.assistance.operit.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_events")
data class NovelEvent(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val title: String,
    val description: String = "",
    val chapterId: String? = null,
    val eventTime: String = "",          // 时间线位置
    val eventType: String = "plot",      // plot / flashback / foreshadow
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
