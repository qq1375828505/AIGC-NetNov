package com.ai.assistance.operit.data.dao.novel

import androidx.room.*
import com.ai.assistance.operit.data.model.novel.*
import kotlinx.coroutines.flow.Flow

@Dao
interface NovelDao {
    // ==================== 作品 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWork(work: NovelWork)

    @Update
    suspend fun updateWork(work: NovelWork)

    @Delete
    suspend fun deleteWork(work: NovelWork)

    @Query("SELECT * FROM novel_works ORDER BY updatedAt DESC")
    fun getAllWorks(): Flow<List<NovelWork>>

    @Query("SELECT * FROM novel_works WHERE id = :workId")
    suspend fun getWorkById(workId: String): NovelWork?

    @Query("DELETE FROM novel_works WHERE id = :workId")
    suspend fun deleteWorkById(workId: String)

    // ==================== 卷 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVolume(volume: NovelVolume)

    @Update
    suspend fun updateVolume(volume: NovelVolume)

    @Delete
    suspend fun deleteVolume(volume: NovelVolume)

    @Query("SELECT * FROM novel_volumes WHERE workId = :workId ORDER BY orderIndex")
    fun getVolumesByWorkId(workId: String): Flow<List<NovelVolume>>

    @Query("SELECT * FROM novel_volumes WHERE id = :volumeId")
    suspend fun getVolumeById(volumeId: String): NovelVolume?

    // ==================== 章节 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChapter(chapter: Chapter)

    @Update
    suspend fun updateChapter(chapter: Chapter)

    @Delete
    suspend fun deleteChapter(chapter: Chapter)

    @Query("SELECT * FROM novel_chapters WHERE workId = :workId ORDER BY sortOrder")
    fun getChaptersByWorkId(workId: String): Flow<List<Chapter>>

    @Query("SELECT * FROM novel_chapters WHERE volumeId = :volumeId ORDER BY sortOrder")
    fun getChaptersByVolumeId(volumeId: String): Flow<List<Chapter>>

    @Query("SELECT * FROM novel_chapters WHERE id = :chapterId")
    suspend fun getChapterById(chapterId: String): Chapter?

    @Query("DELETE FROM novel_chapters WHERE id = :chapterId")
    suspend fun deleteChapterById(chapterId: String)

    @Query("UPDATE novel_chapters SET content = :content, wordCount = :wordCount, updatedAt = :updatedAt WHERE id = :chapterId")
    suspend fun updateChapterContent(chapterId: String, content: String, wordCount: Int, updatedAt: Long)

    // ==================== 角色 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCharacter(character: NovelCharacter)

    @Update
    suspend fun updateCharacter(character: NovelCharacter)

    @Delete
    suspend fun deleteCharacter(character: NovelCharacter)

    @Query("SELECT * FROM novel_characters WHERE workId = :workId ORDER BY createdAt DESC")
    fun getCharactersByWorkId(workId: String): Flow<List<NovelCharacter>>

    @Query("SELECT * FROM novel_characters WHERE id = :characterId")
    suspend fun getCharacterById(characterId: String): NovelCharacter?

    @Query("DELETE FROM novel_characters WHERE id = :characterId")
    suspend fun deleteCharacterById(characterId: String)

    // ==================== 设定 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSetting(setting: NovelSetting)

    @Update
    suspend fun updateSetting(setting: NovelSetting)

    @Delete
    suspend fun deleteSetting(setting: NovelSetting)

    @Query("SELECT * FROM novel_settings WHERE workId = :workId ORDER BY createdAt DESC")
    fun getSettingsByWorkId(workId: String): Flow<List<NovelSetting>>

    @Query("SELECT * FROM novel_settings WHERE id = :settingId")
    suspend fun getSettingById(settingId: String): NovelSetting?

    @Query("DELETE FROM novel_settings WHERE id = :settingId")
    suspend fun deleteSettingById(settingId: String)

    // ==================== 地点 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLocation(location: NovelLocation)

    @Update
    suspend fun updateLocation(location: NovelLocation)

    @Delete
    suspend fun deleteLocation(location: NovelLocation)

    @Query("SELECT * FROM novel_locations WHERE workId = :workId ORDER BY createdAt DESC")
    fun getLocationsByWorkId(workId: String): Flow<List<NovelLocation>>

    @Query("SELECT * FROM novel_locations WHERE id = :locationId")
    suspend fun getLocationById(locationId: String): NovelLocation?

    @Query("DELETE FROM novel_locations WHERE id = :locationId")
    suspend fun deleteLocationById(locationId: String)

    // ==================== 势力 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFaction(faction: NovelFaction)

    @Update
    suspend fun updateFaction(faction: NovelFaction)

    @Delete
    suspend fun deleteFaction(faction: NovelFaction)

    @Query("SELECT * FROM novel_factions WHERE workId = :workId ORDER BY createdAt DESC")
    fun getFactionsByWorkId(workId: String): Flow<List<NovelFaction>>

    @Query("SELECT * FROM novel_factions WHERE id = :factionId")
    suspend fun getFactionById(factionId: String): NovelFaction?

    @Query("DELETE FROM novel_factions WHERE id = :factionId")
    suspend fun deleteFactionById(factionId: String)

    // ==================== 道具 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertItem(item: NovelItem)

    @Update
    suspend fun updateItem(item: NovelItem)

    @Delete
    suspend fun deleteItem(item: NovelItem)

    @Query("SELECT * FROM novel_items WHERE workId = :workId ORDER BY createdAt DESC")
    fun getItemsByWorkId(workId: String): Flow<List<NovelItem>>

    @Query("SELECT * FROM novel_items WHERE id = :itemId")
    suspend fun getItemById(itemId: String): NovelItem?

    @Query("DELETE FROM novel_items WHERE id = :itemId")
    suspend fun deleteItemById(itemId: String)

    // ==================== 伏笔 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlotHook(hook: PlotHook)

    @Update
    suspend fun updatePlotHook(hook: PlotHook)

    @Delete
    suspend fun deletePlotHook(hook: PlotHook)

    @Query("SELECT * FROM novel_plot_hooks WHERE workId = :workId ORDER BY createdAt DESC")
    fun getPlotHooksByWorkId(workId: String): Flow<List<PlotHook>>

    @Query("SELECT * FROM novel_plot_hooks WHERE id = :hookId")
    suspend fun getPlotHookById(hookId: String): PlotHook?

    @Query("DELETE FROM novel_plot_hooks WHERE id = :hookId")
    suspend fun deletePlotHookById(hookId: String)

    // ==================== 参考资料 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReference(reference: ReferenceMaterial)

    @Update
    suspend fun updateReference(reference: ReferenceMaterial)

    @Delete
    suspend fun deleteReference(reference: ReferenceMaterial)

    @Query("SELECT * FROM novel_references WHERE workId = :workId ORDER BY createdAt DESC")
    fun getReferencesByWorkId(workId: String): Flow<List<ReferenceMaterial>>

    @Query("SELECT * FROM novel_references WHERE id = :referenceId")
    suspend fun getReferenceById(referenceId: String): ReferenceMaterial?

    @Query("DELETE FROM novel_references WHERE id = :referenceId")
    suspend fun deleteReferenceById(referenceId: String)

    // ==================== 写作待办 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTodo(todo: WritingTodo)

    @Update
    suspend fun updateTodo(todo: WritingTodo)

    @Delete
    suspend fun deleteTodo(todo: WritingTodo)

    @Query("SELECT * FROM novel_todos WHERE workId = :workId ORDER BY priority DESC, createdAt DESC")
    fun getTodosByWorkId(workId: String): Flow<List<WritingTodo>>

    @Query("SELECT * FROM novel_todos WHERE id = :todoId")
    suspend fun getTodoById(todoId: String): WritingTodo?

    @Query("DELETE FROM novel_todos WHERE id = :todoId")
    suspend fun deleteTodoById(todoId: String)

    // ==================== 番茄预设 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTomatoPreset(preset: TomatoPreset)

    @Update
    suspend fun updateTomatoPreset(preset: TomatoPreset)

    @Delete
    suspend fun deleteTomatoPreset(preset: TomatoPreset)

    @Query("SELECT * FROM tomato_presets ORDER BY category, name")
    fun getAllTomatoPresets(): Flow<List<TomatoPreset>>

    @Query("SELECT * FROM tomato_presets WHERE id = :presetId")
    suspend fun getTomatoPresetById(presetId: String): TomatoPreset?

    @Query("SELECT * FROM tomato_presets WHERE category = :category")
    fun getTomatoPresetsByCategory(category: String): Flow<List<TomatoPreset>>

    @Query("SELECT COUNT(*) FROM tomato_presets")
    suspend fun getTomatoPresetCount(): Int

    // ==================== 番茄 Agent ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTomatoAgent(agent: TomatoAgent)

    @Update
    suspend fun updateTomatoAgent(agent: TomatoAgent)

    @Delete
    suspend fun deleteTomatoAgent(agent: TomatoAgent)

    @Query("SELECT * FROM tomato_agents ORDER BY name")
    fun getAllTomatoAgents(): Flow<List<TomatoAgent>>

    @Query("SELECT * FROM tomato_agents WHERE id = :agentId")
    suspend fun getTomatoAgentById(agentId: String): TomatoAgent?

    // ==================== 写作技能 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWritingSkill(skill: WritingSkill)

    @Update
    suspend fun updateWritingSkill(skill: WritingSkill)

    @Delete
    suspend fun deleteWritingSkill(skill: WritingSkill)

    @Query("SELECT * FROM novel_writing_skills WHERE isEnabled = 1 ORDER BY category, name")
    fun getEnabledWritingSkills(): Flow<List<WritingSkill>>

    @Query("SELECT * FROM novel_writing_skills ORDER BY category, name")
    fun getAllWritingSkills(): Flow<List<WritingSkill>>

    @Query("SELECT * FROM novel_writing_skills WHERE id = :skillId")
    suspend fun getWritingSkillById(skillId: String): WritingSkill?

    // ==================== 设定提醒 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSettingReminder(reminder: SettingReminder)

    @Update
    suspend fun updateSettingReminder(reminder: SettingReminder)

    @Delete
    suspend fun deleteSettingReminder(reminder: SettingReminder)

    @Query("SELECT * FROM novel_setting_reminders WHERE workId = :workId ORDER BY createdAt DESC")
    fun getSettingRemindersByWorkId(workId: String): Flow<List<SettingReminder>>

    @Query("SELECT * FROM novel_setting_reminders WHERE settingId = :settingId")
    fun getSettingRemindersBySettingId(settingId: String): Flow<List<SettingReminder>>

    @Query("SELECT * FROM novel_setting_reminders WHERE id = :reminderId")
    suspend fun getSettingReminderById(reminderId: String): SettingReminder?

    // ==================== 自定义资料夹 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomMaterialFolder(folder: CustomMaterialFolder)

    @Update
    suspend fun updateCustomMaterialFolder(folder: CustomMaterialFolder)

    @Delete
    suspend fun deleteCustomMaterialFolder(folder: CustomMaterialFolder)

    @Query("SELECT * FROM novel_custom_material_folders WHERE workId = :workId ORDER BY orderIndex")
    fun getCustomMaterialFoldersByWorkId(workId: String): Flow<List<CustomMaterialFolder>>

    @Query("SELECT * FROM novel_custom_material_folders WHERE id = :folderId")
    suspend fun getCustomMaterialFolderById(folderId: String): CustomMaterialFolder?

    @Query("DELETE FROM novel_custom_material_folders WHERE id = :folderId")
    suspend fun deleteCustomMaterialFolderById(folderId: String)

    // ==================== 自定义资料条目 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomMaterialItem(item: CustomMaterialItem)

    @Update
    suspend fun updateCustomMaterialItem(item: CustomMaterialItem)

    @Delete
    suspend fun deleteCustomMaterialItem(item: CustomMaterialItem)

    @Query("SELECT * FROM novel_custom_material_items WHERE folderId = :folderId ORDER BY orderIndex")
    fun getCustomMaterialItemsByFolderId(folderId: String): Flow<List<CustomMaterialItem>>

    @Query("SELECT * FROM novel_custom_material_items WHERE id = :itemId")
    suspend fun getCustomMaterialItemById(itemId: String): CustomMaterialItem?

    @Query("DELETE FROM novel_custom_material_items WHERE id = :itemId")
    suspend fun deleteCustomMaterialItemById(itemId: String)

    // ==================== 角色关系 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCharacterRelationship(relationship: CharacterRelationship)

    @Update
    suspend fun updateCharacterRelationship(relationship: CharacterRelationship)

    @Delete
    suspend fun deleteCharacterRelationship(relationship: CharacterRelationship)

    @Query("SELECT * FROM novel_character_relationships WHERE workId = :workId")
    fun getCharacterRelationshipsByWorkId(workId: String): Flow<List<CharacterRelationship>>

    @Query("SELECT * FROM novel_character_relationships WHERE sourceCharacterId = :characterId OR targetCharacterId = :characterId")
    fun getCharacterRelationshipsByCharacterId(characterId: String): Flow<List<CharacterRelationship>>

    @Query("SELECT * FROM novel_character_relationships WHERE id = :relationshipId")
    suspend fun getCharacterRelationshipById(relationshipId: String): CharacterRelationship?

    @Query("DELETE FROM novel_character_relationships WHERE id = :relationshipId")
    suspend fun deleteCharacterRelationshipById(relationshipId: String)

    // ==================== 事件 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNovelEvent(event: NovelEvent)

    @Update
    suspend fun updateNovelEvent(event: NovelEvent)

    @Delete
    suspend fun deleteNovelEvent(event: NovelEvent)

    @Query("SELECT * FROM novel_events WHERE workId = :workId ORDER BY createdAt DESC")
    fun getNovelEventsByWorkId(workId: String): Flow<List<NovelEvent>>

    @Query("SELECT * FROM novel_events WHERE chapterId = :chapterId")
    fun getNovelEventsByChapterId(chapterId: String): Flow<List<NovelEvent>>

    @Query("SELECT * FROM novel_events WHERE id = :eventId")
    suspend fun getNovelEventById(eventId: String): NovelEvent?

    @Query("DELETE FROM novel_events WHERE id = :eventId")
    suspend fun deleteNovelEventById(eventId: String)

    // ==================== 事件参与者 ====================
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNovelEventParticipant(participant: NovelEventParticipant)

    @Delete
    suspend fun deleteNovelEventParticipant(participant: NovelEventParticipant)

    @Query("SELECT * FROM novel_event_participants WHERE eventId = :eventId")
    fun getNovelEventParticipantsByEventId(eventId: String): Flow<List<NovelEventParticipant>>

    @Query("SELECT * FROM novel_event_participants WHERE characterId = :characterId")
    fun getNovelEventParticipantsByCharacterId(characterId: String): Flow<List<NovelEventParticipant>>

    @Query("DELETE FROM novel_event_participants WHERE eventId = :eventId AND characterId = :characterId")
    suspend fun deleteNovelEventParticipant(eventId: String, characterId: String)

    @Query("DELETE FROM novel_event_participants WHERE eventId = :eventId")
    suspend fun deleteAllNovelEventParticipantsByEventId(eventId: String)
}
