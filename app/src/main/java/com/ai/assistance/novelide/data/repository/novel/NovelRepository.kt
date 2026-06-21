package com.ai.assistance.novelide.data.repository.novel

import com.ai.assistance.novelide.data.dao.novel.NovelDao
import com.ai.assistance.novelide.data.model.novel.*
import kotlinx.coroutines.flow.Flow

class NovelRepository(private val dao: NovelDao) {

    // ==================== 作品 ====================
    fun getAllWorks(): Flow<List<NovelWork>> = dao.getAllWorks()

    suspend fun getWorkById(workId: String): NovelWork? = dao.getWorkById(workId)

    suspend fun insertWork(work: NovelWork) = dao.insertWork(work)

    suspend fun updateWork(work: NovelWork) = dao.updateWork(work.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteWork(workId: String) = dao.deleteWorkById(workId)

    // ==================== 卷 ====================
    fun getVolumesByWorkId(workId: String): Flow<List<NovelVolume>> = dao.getVolumesByWorkId(workId)

    suspend fun getVolumeById(volumeId: String): NovelVolume? = dao.getVolumeById(volumeId)

    suspend fun insertVolume(volume: NovelVolume) = dao.insertVolume(volume)

    suspend fun updateVolume(volume: NovelVolume) = dao.updateVolume(volume)

    suspend fun deleteVolume(volume: NovelVolume) = dao.deleteVolume(volume)

    // ==================== 章节 ====================
    fun getChaptersByWorkId(workId: String): Flow<List<Chapter>> = dao.getChaptersByWorkId(workId)

    fun getChaptersByVolumeId(volumeId: String): Flow<List<Chapter>> = dao.getChaptersByVolumeId(volumeId)

    suspend fun getChapterById(chapterId: String): Chapter? = dao.getChapterById(chapterId)

    suspend fun insertChapter(chapter: Chapter) = dao.insertChapter(chapter)

    suspend fun updateChapter(chapter: Chapter) = dao.updateChapter(chapter.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteChapter(chapterId: String) = dao.deleteChapterById(chapterId)

    suspend fun updateChapterContent(chapterId: String, content: String, wordCount: Int) {
        dao.updateChapterContent(chapterId, content, wordCount, System.currentTimeMillis())
    }

    // ==================== 角色 ====================
    fun getCharactersByWorkId(workId: String): Flow<List<NovelCharacter>> = dao.getCharactersByWorkId(workId)

    suspend fun getCharacterById(characterId: String): NovelCharacter? = dao.getCharacterById(characterId)

    suspend fun insertCharacter(character: NovelCharacter) = dao.insertCharacter(character)

    suspend fun updateCharacter(character: NovelCharacter) = dao.updateCharacter(character.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteCharacter(characterId: String) = dao.deleteCharacterById(characterId)

    // ==================== 设定 ====================
    fun getSettingsByWorkId(workId: String): Flow<List<NovelSetting>> = dao.getSettingsByWorkId(workId)

    suspend fun getSettingById(settingId: String): NovelSetting? = dao.getSettingById(settingId)

    suspend fun insertSetting(setting: NovelSetting) = dao.insertSetting(setting)

    suspend fun updateSetting(setting: NovelSetting) = dao.updateSetting(setting.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteSetting(settingId: String) = dao.deleteSettingById(settingId)

    // ==================== 地点 ====================
    fun getLocationsByWorkId(workId: String): Flow<List<NovelLocation>> = dao.getLocationsByWorkId(workId)

    suspend fun getLocationById(locationId: String): NovelLocation? = dao.getLocationById(locationId)

    suspend fun insertLocation(location: NovelLocation) = dao.insertLocation(location)

    suspend fun updateLocation(location: NovelLocation) = dao.updateLocation(location.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteLocation(locationId: String) = dao.deleteLocationById(locationId)

    // ==================== 势力 ====================
    fun getFactionsByWorkId(workId: String): Flow<List<NovelFaction>> = dao.getFactionsByWorkId(workId)

    suspend fun getFactionById(factionId: String): NovelFaction? = dao.getFactionById(factionId)

    suspend fun insertFaction(faction: NovelFaction) = dao.insertFaction(faction)

    suspend fun updateFaction(faction: NovelFaction) = dao.updateFaction(faction.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteFaction(factionId: String) = dao.deleteFactionById(factionId)

    // ==================== 道具 ====================
    fun getItemsByWorkId(workId: String): Flow<List<NovelItem>> = dao.getItemsByWorkId(workId)

    suspend fun getItemById(itemId: String): NovelItem? = dao.getItemById(itemId)

    suspend fun insertItem(item: NovelItem) = dao.insertItem(item)

    suspend fun updateItem(item: NovelItem) = dao.updateItem(item.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteItem(itemId: String) = dao.deleteItemById(itemId)

    // ==================== 伏笔 ====================
    fun getPlotHooksByWorkId(workId: String): Flow<List<PlotHook>> = dao.getPlotHooksByWorkId(workId)

    suspend fun getPlotHookById(hookId: String): PlotHook? = dao.getPlotHookById(hookId)

    suspend fun insertPlotHook(hook: PlotHook) = dao.insertPlotHook(hook)

    suspend fun updatePlotHook(hook: PlotHook) = dao.updatePlotHook(hook.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deletePlotHook(hookId: String) = dao.deletePlotHookById(hookId)

    // ==================== 参考资料 ====================
    fun getReferencesByWorkId(workId: String): Flow<List<ReferenceMaterial>> = dao.getReferencesByWorkId(workId)

    suspend fun getReferenceById(referenceId: String): ReferenceMaterial? = dao.getReferenceById(referenceId)

    suspend fun insertReference(reference: ReferenceMaterial) = dao.insertReference(reference)

    suspend fun updateReference(reference: ReferenceMaterial) = dao.updateReference(reference.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteReference(referenceId: String) = dao.deleteReferenceById(referenceId)

    // ==================== 写作待办 ====================
    fun getTodosByWorkId(workId: String): Flow<List<WritingTodo>> = dao.getTodosByWorkId(workId)

    suspend fun getTodoById(todoId: String): WritingTodo? = dao.getTodoById(todoId)

    suspend fun insertTodo(todo: WritingTodo) = dao.insertTodo(todo)

    suspend fun updateTodo(todo: WritingTodo) = dao.updateTodo(todo.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteTodo(todoId: String) = dao.deleteTodoById(todoId)

    // ==================== 番茄预设 ====================
    fun getAllTomatoPresets(): Flow<List<TomatoPreset>> = dao.getAllTomatoPresets()

    fun getTomatoPresetsByCategory(category: String): Flow<List<TomatoPreset>> = dao.getTomatoPresetsByCategory(category)

    suspend fun getTomatoPresetById(presetId: String): TomatoPreset? = dao.getTomatoPresetById(presetId)

    suspend fun insertTomatoPreset(preset: TomatoPreset) = dao.insertTomatoPreset(preset)

    suspend fun updateTomatoPreset(preset: TomatoPreset) = dao.updateTomatoPreset(preset.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteTomatoPreset(presetId: String) = dao.deleteTomatoPreset(dao.getTomatoPresetById(presetId) ?: return)

    suspend fun getTomatoPresetCount(): Int = dao.getTomatoPresetCount()

    // ==================== 番茄 Agent ====================
    fun getAllTomatoAgents(): Flow<List<TomatoAgent>> = dao.getAllTomatoAgents()

    suspend fun getTomatoAgentById(agentId: String): TomatoAgent? = dao.getTomatoAgentById(agentId)

    suspend fun insertTomatoAgent(agent: TomatoAgent) = dao.insertTomatoAgent(agent)

    suspend fun updateTomatoAgent(agent: TomatoAgent) = dao.updateTomatoAgent(agent.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteTomatoAgent(agentId: String) = dao.deleteTomatoAgent(dao.getTomatoAgentById(agentId) ?: return)

    // ==================== 写作技能 ====================
    fun getEnabledWritingSkills(): Flow<List<WritingSkill>> = dao.getEnabledWritingSkills()

    fun getAllWritingSkills(): Flow<List<WritingSkill>> = dao.getAllWritingSkills()

    suspend fun getWritingSkillById(skillId: String): WritingSkill? = dao.getWritingSkillById(skillId)

    suspend fun insertWritingSkill(skill: WritingSkill) = dao.insertWritingSkill(skill)

    suspend fun updateWritingSkill(skill: WritingSkill) = dao.updateWritingSkill(skill.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteWritingSkill(skill: WritingSkill) = dao.deleteWritingSkill(skill)

    // ==================== 设定提醒 ====================
    fun getSettingRemindersByWorkId(workId: String): Flow<List<SettingReminder>> = dao.getSettingRemindersByWorkId(workId)

    fun getSettingRemindersBySettingId(settingId: String): Flow<List<SettingReminder>> = dao.getSettingRemindersBySettingId(settingId)

    suspend fun getSettingReminderById(reminderId: String): SettingReminder? = dao.getSettingReminderById(reminderId)

    suspend fun insertSettingReminder(reminder: SettingReminder) = dao.insertSettingReminder(reminder)

    suspend fun updateSettingReminder(reminder: SettingReminder) = dao.updateSettingReminder(reminder.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteSettingReminder(reminder: SettingReminder) = dao.deleteSettingReminder(reminder)

    // ==================== 自定义资料夹 ====================
    fun getCustomMaterialFoldersByWorkId(workId: String): Flow<List<CustomMaterialFolder>> = dao.getCustomMaterialFoldersByWorkId(workId)

    suspend fun getCustomMaterialFolderById(folderId: String): CustomMaterialFolder? = dao.getCustomMaterialFolderById(folderId)

    suspend fun insertCustomMaterialFolder(folder: CustomMaterialFolder) = dao.insertCustomMaterialFolder(folder)

    suspend fun updateCustomMaterialFolder(folder: CustomMaterialFolder) = dao.updateCustomMaterialFolder(folder.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteCustomMaterialFolder(folderId: String) = dao.deleteCustomMaterialFolderById(folderId)

    // ==================== 自定义资料条目 ====================
    fun getCustomMaterialItemsByFolderId(folderId: String): Flow<List<CustomMaterialItem>> = dao.getCustomMaterialItemsByFolderId(folderId)

    suspend fun getCustomMaterialItemById(itemId: String): CustomMaterialItem? = dao.getCustomMaterialItemById(itemId)

    suspend fun insertCustomMaterialItem(item: CustomMaterialItem) = dao.insertCustomMaterialItem(item)

    suspend fun updateCustomMaterialItem(item: CustomMaterialItem) = dao.updateCustomMaterialItem(item.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteCustomMaterialItem(itemId: String) = dao.deleteCustomMaterialItemById(itemId)

    // ==================== 角色关系 ====================
    fun getCharacterRelationshipsByWorkId(workId: String): Flow<List<CharacterRelationship>> = dao.getCharacterRelationshipsByWorkId(workId)

    fun getCharacterRelationshipsByCharacterId(characterId: String): Flow<List<CharacterRelationship>> = dao.getCharacterRelationshipsByCharacterId(characterId)

    suspend fun getCharacterRelationshipById(relationshipId: String): CharacterRelationship? = dao.getCharacterRelationshipById(relationshipId)

    suspend fun insertCharacterRelationship(relationship: CharacterRelationship) = dao.insertCharacterRelationship(relationship)

    suspend fun updateCharacterRelationship(relationship: CharacterRelationship) = dao.updateCharacterRelationship(relationship.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteCharacterRelationship(relationshipId: String) = dao.deleteCharacterRelationshipById(relationshipId)

    // ==================== 事件 ====================
    fun getNovelEventsByWorkId(workId: String): Flow<List<NovelEvent>> = dao.getNovelEventsByWorkId(workId)

    fun getNovelEventsByChapterId(chapterId: String): Flow<List<NovelEvent>> = dao.getNovelEventsByChapterId(chapterId)

    suspend fun getNovelEventById(eventId: String): NovelEvent? = dao.getNovelEventById(eventId)

    suspend fun insertNovelEvent(event: NovelEvent) = dao.insertNovelEvent(event)

    suspend fun updateNovelEvent(event: NovelEvent) = dao.updateNovelEvent(event.copy(updatedAt = System.currentTimeMillis()))

    suspend fun deleteNovelEvent(eventId: String) = dao.deleteNovelEventById(eventId)

    // ==================== 事件参与者 ====================
    fun getNovelEventParticipantsByEventId(eventId: String): Flow<List<NovelEventParticipant>> = dao.getNovelEventParticipantsByEventId(eventId)

    fun getNovelEventParticipantsByCharacterId(characterId: String): Flow<List<NovelEventParticipant>> = dao.getNovelEventParticipantsByCharacterId(characterId)

    suspend fun insertNovelEventParticipant(participant: NovelEventParticipant) = dao.insertNovelEventParticipant(participant)

    suspend fun deleteNovelEventParticipant(eventId: String, characterId: String) = dao.deleteNovelEventParticipant(eventId, characterId)

    suspend fun deleteAllNovelEventParticipantsByEventId(eventId: String) = dao.deleteAllNovelEventParticipantsByEventId(eventId)
}
