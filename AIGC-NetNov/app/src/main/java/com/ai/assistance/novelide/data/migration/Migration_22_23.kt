package com.ai.assistance.novelide.data.migration

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

val MIGRATION_22_23 = object : Migration(22, 23) {
    override fun migrate(db: SupportSQLiteDatabase) {
        // NovelCharacter: 添加 gender, age, notes 字段
        try { 
            db.execSQL("ALTER TABLE `novel_characters` ADD COLUMN `gender` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add gender column to novel_characters: ${e.message}")
        }
        try { 
            db.execSQL("ALTER TABLE `novel_characters` ADD COLUMN `age` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add age column to novel_characters: ${e.message}")
        }
        try { 
            db.execSQL("ALTER TABLE `novel_characters` ADD COLUMN `notes` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add notes column to novel_characters: ${e.message}")
        }
        
        // NovelFaction: 添加 type, notes 字段
        try { 
            db.execSQL("ALTER TABLE `novel_factions` ADD COLUMN `type` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add type column to novel_factions: ${e.message}")
        }
        try { 
            db.execSQL("ALTER TABLE `novel_factions` ADD COLUMN `notes` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add notes column to novel_factions: ${e.message}")
        }
        
        // NovelItem: 添加 type, notes 字段
        try { 
            db.execSQL("ALTER TABLE `novel_items` ADD COLUMN `type` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add type column to novel_items: ${e.message}")
        }
        try { 
            db.execSQL("ALTER TABLE `novel_items` ADD COLUMN `notes` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add notes column to novel_items: ${e.message}")
        }
        
        // NovelSetting: 添加 category, notes 字段
        try { 
            db.execSQL("ALTER TABLE `novel_settings` ADD COLUMN `category` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add category column to novel_settings: ${e.message}")
        }
        try { 
            db.execSQL("ALTER TABLE `novel_settings` ADD COLUMN `notes` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add notes column to novel_settings: ${e.message}")
        }
        
        // PlotHook: 添加 title, notes 字段
        try { 
            db.execSQL("ALTER TABLE `novel_plot_hooks` ADD COLUMN `title` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add title column to novel_plot_hooks: ${e.message}")
        }
        try { 
            db.execSQL("ALTER TABLE `novel_plot_hooks` ADD COLUMN `notes` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add notes column to novel_plot_hooks: ${e.message}")
        }
        
        // ReferenceMaterial: 添加 type, url, notes 字段
        try { 
            db.execSQL("ALTER TABLE `novel_references` ADD COLUMN `type` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add type column to novel_references: ${e.message}")
        }
        try { 
            db.execSQL("ALTER TABLE `novel_references` ADD COLUMN `url` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add url column to novel_references: ${e.message}")
        }
        try { 
            db.execSQL("ALTER TABLE `novel_references` ADD COLUMN `notes` TEXT NOT NULL DEFAULT ''") 
        } catch (e: Exception) {
            android.util.Log.w("Migration", "Failed to add notes column to novel_references: ${e.message}")
        }
        
        // 记录迁移日志
        android.util.Log.d("Migration", "Successfully migrated database from version 22 to 23: added new fields to multiple tables")
    }
}
