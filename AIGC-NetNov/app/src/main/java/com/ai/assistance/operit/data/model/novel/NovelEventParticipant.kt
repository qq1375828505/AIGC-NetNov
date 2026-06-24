package com.ai.assistance.operit.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_event_participants")
data class NovelEventParticipant(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val eventId: String,
    val characterId: String,
    val role: String = ""               // 主角/配角/目击者
)
