package com.ai.assistance.novelide.data.model.novel

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(
    tableName = "outline_nodes",
    foreignKeys = [
        ForeignKey(
            entity = NovelWork::class,
            parentColumns = ["id"],
            childColumns = ["workId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("workId")]
)
data class OutlineNode(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val title: String,
    val content: String = "",
    val parentId: String? = null,
    val sortOrder: Int = 0,
    val level: Int = 0,
    val chapterId: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
