package com.ai.assistance.operit.data.migration

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

val MIGRATION_20_21 = object : Migration(20, 21) {
    override fun migrate(db: SupportSQLiteDatabase) {
        // 作品表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_works` (
                `id` TEXT NOT NULL,
                `title` TEXT NOT NULL,
                `genre` TEXT NOT NULL DEFAULT '',
                `description` TEXT NOT NULL DEFAULT '',
                `status` TEXT NOT NULL DEFAULT 'ongoing',
                `targetWordCount` INTEGER NOT NULL DEFAULT 0,
                `currentWordCount` INTEGER NOT NULL DEFAULT 0,
                `chapterCount` INTEGER NOT NULL DEFAULT 0,
                `coverPath` TEXT NOT NULL DEFAULT '',
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`)
            )
        """)

        // 卷表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_volumes` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `title` TEXT NOT NULL,
                `orderIndex` INTEGER NOT NULL DEFAULT 0,
                `summary` TEXT NOT NULL DEFAULT '',
                `createdAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE
            )
        """)

        // 章节表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_chapters` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `volumeId` TEXT,
                `title` TEXT NOT NULL,
                `content` TEXT NOT NULL DEFAULT '',
                `sortOrder` INTEGER NOT NULL DEFAULT 0,
                `wordCount` INTEGER NOT NULL DEFAULT 0,
                `status` TEXT NOT NULL DEFAULT 'draft',
                `summary` TEXT,
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE,
                FOREIGN KEY(`volumeId`) REFERENCES `novel_volumes`(`id`) ON DELETE SET NULL
            )
        """)

        // 角色表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_characters` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `name` TEXT NOT NULL,
                `role` TEXT NOT NULL DEFAULT '',
                `appearance` TEXT NOT NULL DEFAULT '',
                `personality` TEXT NOT NULL DEFAULT '',
                `background` TEXT NOT NULL DEFAULT '',
                `tags` TEXT NOT NULL DEFAULT '',
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE
            )
        """)

        // 设定表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_settings` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `name` TEXT NOT NULL,
                `content` TEXT NOT NULL DEFAULT '',
                `worldBuilding` TEXT NOT NULL DEFAULT '',
                `tags` TEXT NOT NULL DEFAULT '',
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE
            )
        """)

        // 地点表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_locations` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `name` TEXT NOT NULL,
                `description` TEXT NOT NULL DEFAULT '',
                `tags` TEXT NOT NULL DEFAULT '',
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE
            )
        """)

        // 势力表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_factions` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `name` TEXT NOT NULL,
                `leader` TEXT NOT NULL DEFAULT '',
                `powerLevel` TEXT NOT NULL DEFAULT '',
                `description` TEXT NOT NULL DEFAULT '',
                `tags` TEXT NOT NULL DEFAULT '',
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE
            )
        """)

        // 道具表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_items` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `name` TEXT NOT NULL,
                `grade` TEXT NOT NULL DEFAULT '',
                `holder` TEXT NOT NULL DEFAULT '',
                `isKey` INTEGER NOT NULL DEFAULT 0,
                `description` TEXT NOT NULL DEFAULT '',
                `tags` TEXT NOT NULL DEFAULT '',
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE
            )
        """)

        // 伏笔表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_plot_hooks` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `content` TEXT NOT NULL,
                `status` TEXT NOT NULL DEFAULT 'planted',
                `plantedChapterId` TEXT,
                `resolvedChapterId` TEXT,
                `idleChapters` INTEGER NOT NULL DEFAULT 0,
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE
            )
        """)

        // 参考资料表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_references` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `title` TEXT NOT NULL,
                `content` TEXT NOT NULL DEFAULT '',
                `source` TEXT NOT NULL DEFAULT '',
                `tags` TEXT NOT NULL DEFAULT '',
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE
            )
        """)

        // 写作待办表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_todos` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `content` TEXT NOT NULL,
                `isCompleted` INTEGER NOT NULL DEFAULT 0,
                `priority` INTEGER NOT NULL DEFAULT 0,
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE
            )
        """)

        // 番茄预设表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `tomato_presets` (
                `id` TEXT NOT NULL,
                `name` TEXT NOT NULL,
                `category` TEXT NOT NULL,
                `description` TEXT NOT NULL DEFAULT '',
                `workMinutes` INTEGER NOT NULL DEFAULT 25,
                `breakMinutes` INTEGER NOT NULL DEFAULT 5,
                `icon` TEXT NOT NULL DEFAULT '',
                `systemPrompt` TEXT NOT NULL DEFAULT '',
                `tags` TEXT NOT NULL DEFAULT '',
                `isBuiltin` INTEGER NOT NULL DEFAULT 1,
                `createdAt` INTEGER NOT NULL DEFAULT 0,
                `updatedAt` INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY(`id`)
            )
        """)

        // 番茄 Agent 表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `tomato_agents` (
                `id` TEXT NOT NULL,
                `name` TEXT NOT NULL,
                `icon` TEXT NOT NULL DEFAULT '',
                `description` TEXT NOT NULL DEFAULT '',
                `systemPrompt` TEXT NOT NULL DEFAULT '',
                `parameterPrompts` TEXT NOT NULL DEFAULT '',
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`)
            )
        """)

        // 写作技能表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_writing_skills` (
                `id` TEXT NOT NULL,
                `name` TEXT NOT NULL,
                `description` TEXT NOT NULL DEFAULT '',
                `systemPrompt` TEXT NOT NULL DEFAULT '',
                `category` TEXT NOT NULL DEFAULT '',
                `isEnabled` INTEGER NOT NULL DEFAULT 1,
                `isBuiltin` INTEGER NOT NULL DEFAULT 0,
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`)
            )
        """)

        // 设定提醒表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_setting_reminders` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `settingId` TEXT NOT NULL,
                `reminderText` TEXT NOT NULL DEFAULT '',
                `triggerChapterId` TEXT,
                `isResolved` INTEGER NOT NULL DEFAULT 0,
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE,
                FOREIGN KEY(`settingId`) REFERENCES `novel_settings`(`id`) ON DELETE CASCADE
            )
        """)

        // 自定义资料夹表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_custom_material_folders` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `name` TEXT NOT NULL,
                `icon` TEXT NOT NULL DEFAULT '',
                `orderIndex` INTEGER NOT NULL DEFAULT 0,
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE
            )
        """)

        // 自定义资料条目表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_custom_material_items` (
                `id` TEXT NOT NULL,
                `folderId` TEXT NOT NULL,
                `title` TEXT NOT NULL,
                `content` TEXT NOT NULL DEFAULT '',
                `orderIndex` INTEGER NOT NULL DEFAULT 0,
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`folderId`) REFERENCES `novel_custom_material_folders`(`id`) ON DELETE CASCADE
            )
        """)

        // 角色关系表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_character_relationships` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `sourceCharacterId` TEXT NOT NULL,
                `targetCharacterId` TEXT NOT NULL,
                `relationType` TEXT NOT NULL,
                `intensity` INTEGER NOT NULL DEFAULT 1,
                `color` TEXT NOT NULL DEFAULT '',
                `description` TEXT NOT NULL DEFAULT '',
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE,
                FOREIGN KEY(`sourceCharacterId`) REFERENCES `novel_characters`(`id`) ON DELETE CASCADE,
                FOREIGN KEY(`targetCharacterId`) REFERENCES `novel_characters`(`id`) ON DELETE CASCADE
            )
        """)

        // 事件表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_events` (
                `id` TEXT NOT NULL,
                `workId` TEXT NOT NULL,
                `title` TEXT NOT NULL,
                `description` TEXT NOT NULL DEFAULT '',
                `chapterId` TEXT,
                `eventTime` TEXT NOT NULL DEFAULT '',
                `eventType` TEXT NOT NULL DEFAULT 'plot',
                `createdAt` INTEGER NOT NULL,
                `updatedAt` INTEGER NOT NULL,
                PRIMARY KEY(`id`),
                FOREIGN KEY(`workId`) REFERENCES `novel_works`(`id`) ON DELETE CASCADE,
                FOREIGN KEY(`chapterId`) REFERENCES `novel_chapters`(`id`) ON DELETE SET NULL
            )
        """)

        // 事件参与者表
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS `novel_event_participants` (
                `id` TEXT NOT NULL,
                `eventId` TEXT NOT NULL,
                `characterId` TEXT NOT NULL,
                `role` TEXT NOT NULL DEFAULT '',
                PRIMARY KEY(`id`),
                FOREIGN KEY(`eventId`) REFERENCES `novel_events`(`id`) ON DELETE CASCADE,
                FOREIGN KEY(`characterId`) REFERENCES `novel_characters`(`id`) ON DELETE CASCADE
            )
        """)

        // 创建索引
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_volumes_workId` ON `novel_volumes` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_chapters_workId` ON `novel_chapters` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_chapters_volumeId` ON `novel_chapters` (`volumeId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_characters_workId` ON `novel_characters` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_settings_workId` ON `novel_settings` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_locations_workId` ON `novel_locations` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_factions_workId` ON `novel_factions` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_items_workId` ON `novel_items` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_plot_hooks_workId` ON `novel_plot_hooks` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_references_workId` ON `novel_references` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_todos_workId` ON `novel_todos` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_setting_reminders_workId` ON `novel_setting_reminders` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_setting_reminders_settingId` ON `novel_setting_reminders` (`settingId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_custom_material_folders_workId` ON `novel_custom_material_folders` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_custom_material_items_folderId` ON `novel_custom_material_items` (`folderId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_character_relationships_workId` ON `novel_character_relationships` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_character_relationships_sourceCharacterId` ON `novel_character_relationships` (`sourceCharacterId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_character_relationships_targetCharacterId` ON `novel_character_relationships` (`targetCharacterId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_events_workId` ON `novel_events` (`workId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_events_chapterId` ON `novel_events` (`chapterId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_event_participants_eventId` ON `novel_event_participants` (`eventId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_novel_event_participants_characterId` ON `novel_event_participants` (`characterId`)")
    }
}
