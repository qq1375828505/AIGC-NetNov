package com.ai.assistance.novelide.data.migration

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

val MIGRATION_21_22 = object : Migration(21, 22) {
    override fun migrate(db: SupportSQLiteDatabase) {
        // 创建大纲节点表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `outline_nodes` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `title` TEXT NOT NULL,
                `content` TEXT NOT NULL DEFAULT '',
                `parentId` TEXT,
                `sortOrder` INTEGER NOT NULL DEFAULT 0,
                `level` INTEGER NOT NULL DEFAULT 0,
                `chapterId` TEXT,
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE
            )
        """)
        
        // 创建索引
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_outline_nodes_workId` ON `outline_nodes` (`workId`)")
        
        // 记录迁移日志
        android.util.Log.d("Migration", "Successfully migrated database from version 21 to 22: added outline_nodes table")
    }
}
