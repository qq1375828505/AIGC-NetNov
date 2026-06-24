package com.ai.assistance.operit.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_character_relationships")
data class CharacterRelationship(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val sourceCharacterId: String,
    val targetCharacterId: String,
    val relationType: String,
    val intensity: Int = 1,              // 关系强度 1-5
    val color: String = "",
    val description: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
