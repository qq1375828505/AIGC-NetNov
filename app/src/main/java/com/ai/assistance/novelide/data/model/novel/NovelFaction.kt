package com.ai.assistance.novelide.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_factions")
data class NovelFaction(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val name: String,
    val leader: String = "",
    val powerLevel: String = "",
    val description: String = "",
    val tags: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
