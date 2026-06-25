package com.ai.assistance.novelide.data.agent

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

/**
 * 通用 AI Agent 独立子 Room 数据库
 *
 * 与主 AppDatabase (novelide.db) 完全独立，db 文件名 novelide_agent.db
 * 不会影响 AppDatabase.kt / NovelDao.kt / NovelRepository.kt
 */
@Database(entities = [AgentEntity::class], version = 1, exportSchema = false)
abstract class AgentDatabase : RoomDatabase() {
    abstract fun agentDao(): AgentDao

    companion object {
        @Volatile
        private var INSTANCE: AgentDatabase? = null

        fun getInstance(context: Context): AgentDatabase = INSTANCE ?: synchronized(this) {
            INSTANCE ?: Room.databaseBuilder(
                context.applicationContext,
                AgentDatabase::class.java,
                "novelide_agent.db"
            ).build().also { INSTANCE = it }
        }
    }
}
