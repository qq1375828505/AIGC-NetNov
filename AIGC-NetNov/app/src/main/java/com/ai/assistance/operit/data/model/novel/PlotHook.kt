package com.ai.assistance.operit.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_plot_hooks")
data class PlotHook(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val content: String,
    val status: String = "planted",      // planted / recycled / abandoned
    val plantedChapterId: String? = null,
    val resolvedChapterId: String? = null,
    val idleChapters: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
