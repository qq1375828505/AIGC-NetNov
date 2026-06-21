package com.ai.assistance.novelide.data.model.novel

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(
    tableName = "novel_chapters",
    foreignKeys = [
        ForeignKey(
            entity = NovelWork::class,
            parentColumns = ["id"],
            childColumns = ["workId"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = NovelVolume::class,
            parentColumns = ["id"],
            childColumns = ["volumeId"],
            onDelete = ForeignKey.SET_NULL
        )
    ]
)
data class Chapter(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val volumeId: String? = null,
    val title: String,
    val content: String = "",
    val sortOrder: Int = 0,
    val wordCount: Int = 0,
    val status: String = "draft",         // unwritten / draft / polishing / completed / exported
    val summary: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
