package com.ai.assistance.novelide.data.workflow

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [WorkflowEntity::class], version = 1, exportSchema = false)
abstract class WorkflowDatabase : RoomDatabase() {
    abstract fun workflowDao(): WorkflowDao

    companion object {
        @Volatile
        private var INSTANCE: WorkflowDatabase? = null

        fun getInstance(context: Context): WorkflowDatabase = INSTANCE ?: synchronized(this) {
            INSTANCE ?: Room.databaseBuilder(
                context.applicationContext,
                WorkflowDatabase::class.java,
                "novelide_workflow.db"
            ).build().also { INSTANCE = it }
        }
    }
}
