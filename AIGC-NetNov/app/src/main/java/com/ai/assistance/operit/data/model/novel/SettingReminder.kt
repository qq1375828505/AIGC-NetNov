package com.ai.assistance.operit.data.model.novel

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "novel_setting_reminders")
data class SettingReminder(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val workId: String,
    val settingId: String,               // 关联 novel_settings.id
    val reminderText: String = "",
    val triggerChapterId: String? = null, // 在哪一章应该触发/检查
    val isResolved: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
