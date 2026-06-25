package com.ai.assistance.novelide.data.writingconfig

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

/**
 * 小说写作配置子数据库
 *
 * 与上游 AppDatabase 完全独立，专门存放：
 *  - NovelModelConfigEntity  写作专用 Model 配置
 *  - NovelTokenStatEntity     每日 Token 消耗统计
 *
 * 数据库文件名: novelide_writing_config.db
 */
@Database(
    entities = [NovelModelConfigEntity::class, NovelTokenStatEntity::class],
    version = 1,
    exportSchema = false
)
abstract class WritingConfigDatabase : RoomDatabase() {
    abstract fun writingConfigDao(): NovelWritingConfigDao

    companion object {
        @Volatile
        private var INSTANCE: WritingConfigDatabase? = null

        fun getInstance(context: Context): WritingConfigDatabase = INSTANCE ?: synchronized(this) {
            INSTANCE ?: Room.databaseBuilder(
                context.applicationContext,
                WritingConfigDatabase::class.java,
                "novelide_writing_config.db"
            ).build().also { INSTANCE = it }
        }
    }
}
