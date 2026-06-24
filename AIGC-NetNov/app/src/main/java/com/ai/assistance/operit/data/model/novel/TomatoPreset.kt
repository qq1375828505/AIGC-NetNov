package com.ai.assistance.operit.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "tomato_presets")
data class TomatoPreset(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val category: String,
    val description: String = "",
    val workMinutes: Int = 25,
    val breakMinutes: Int = 5,
    val icon: String = "",
    val systemPrompt: String = "",
    val tags: String = "",
    val isBuiltin: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
