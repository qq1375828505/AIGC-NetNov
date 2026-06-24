package com.ai.assistance.operit.data.dao.novel

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.ai.assistance.operit.data.AppDatabase
import com.ai.assistance.operit.data.model.novel.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import java.util.UUID

@RunWith(AndroidJUnit4::class)
class NovelDaoTest {

    private lateinit var database: AppDatabase
    private lateinit var dao: NovelDao

    @Before
    fun setup() {
        database = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            AppDatabase::class.java
        ).allowMainThreadQueries().build()
        dao = database.novelDao()
    }

    @After
    fun teardown() {
        database.close()
    }

    // ==================== 作品测试 ====================

    @Test
    fun insertAndGetWork() = runTest {
        val work = NovelWork(id = "w1", title = "测试作品")
        dao.insertWork(work)

        val result = dao.getWorkById("w1")
        assertNotNull(result)
        assertEquals("测试作品", result?.title)
    }

    @Test
    fun getAllWorks() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "作品1"))
        dao.insertWork(NovelWork(id = "w2", title = "作品2"))

        val works = dao.getAllWorks().first()
        assertEquals(2, works.size)
    }

    @Test
    fun updateWork() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "原标题"))
        val work = dao.getWorkById("w1")!!
        dao.updateWork(work.copy(title = "新标题"))

        val result = dao.getWorkById("w1")
        assertEquals("新标题", result?.title)
    }

    @Test
    fun deleteWork() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "待删除"))
        dao.deleteWorkById("w1")

        val result = dao.getWorkById("w1")
        assertNull(result)
    }

    // ==================== 章节测试 ====================

    @Test
    fun insertAndGetChapter() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "作品"))
        val chapter = Chapter(id = "c1", workId = "w1", title = "第一章")
        dao.insertChapter(chapter)

        val result = dao.getChapterById("c1")
        assertNotNull(result)
        assertEquals("第一章", result?.title)
    }

    @Test
    fun getChaptersByWorkId() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "作品"))
        dao.insertChapter(Chapter(id = "c1", workId = "w1", title = "第一章", sortOrder = 1))
        dao.insertChapter(Chapter(id = "c2", workId = "w1", title = "第二章", sortOrder = 2))

        val chapters = dao.getChaptersByWorkId("w1").first()
        assertEquals(2, chapters.size)
        assertEquals("第一章", chapters[0].title)
    }

    @Test
    fun updateChapterContent() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "作品"))
        dao.insertChapter(Chapter(id = "c1", workId = "w1", title = "第一章"))

        dao.updateChapterContent("c1", "新内容", 100, System.currentTimeMillis())

        val result = dao.getChapterById("c1")
        assertEquals("新内容", result?.content)
        assertEquals(100, result?.wordCount)
    }

    @Test
    fun deleteChapterCascade() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "作品"))
        dao.insertChapter(Chapter(id = "c1", workId = "w1", title = "第一章"))

        dao.deleteWorkById("w1")

        val chapters = dao.getChaptersByWorkId("w1").first()
        assertTrue(chapters.isEmpty())
    }

    // ==================== 角色测试 ====================

    @Test
    fun insertAndGetCharacter() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "作品"))
        val character = NovelCharacter(id = "ch1", workId = "w1", name = "主角")
        dao.insertCharacter(character)

        val result = dao.getCharacterById("ch1")
        assertNotNull(result)
        assertEquals("主角", result?.name)
    }

    @Test
    fun getCharactersByWorkId() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "作品"))
        dao.insertCharacter(NovelCharacter(id = "ch1", workId = "w1", name = "角色1"))
        dao.insertCharacter(NovelCharacter(id = "ch2", workId = "w1", name = "角色2"))

        val characters = dao.getCharactersByWorkId("w1").first()
        assertEquals(2, characters.size)
    }

    // ==================== 番茄预设测试 ====================

    @Test
    fun insertAndGetTomatoPreset() = runTest {
        val preset = TomatoPreset(id = "p1", name = "专注模式", category = "通用")
        dao.insertTomatoPreset(preset)

        val result = dao.getTomatoPresetById("p1")
        assertNotNull(result)
        assertEquals("专注模式", result?.name)
    }

    @Test
    fun getTomatoPresetsByCategory() = runTest {
        dao.insertTomatoPreset(TomatoPreset(id = "p1", name = "预设1", category = "都市"))
        dao.insertTomatoPreset(TomatoPreset(id = "p2", name = "预设2", category = "都市"))
        dao.insertTomatoPreset(TomatoPreset(id = "p3", name = "预设3", category = "玄幻"))

        val presets = dao.getTomatoPresetsByCategory("都市").first()
        assertEquals(2, presets.size)
    }

    @Test
    fun getTomatoPresetCount() = runTest {
        dao.insertTomatoPreset(TomatoPreset(id = "p1", name = "预设1", category = "通用"))
        dao.insertTomatoPreset(TomatoPreset(id = "p2", name = "预设2", category = "通用"))

        val count = dao.getTomatoPresetCount()
        assertEquals(2, count)
    }

    // ==================== 角色关系测试 ====================

    @Test
    fun insertAndGetCharacterRelationship() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "作品"))
        dao.insertCharacter(NovelCharacter(id = "ch1", workId = "w1", name = "角色1"))
        dao.insertCharacter(NovelCharacter(id = "ch2", workId = "w1", name = "角色2"))

        val relationship = CharacterRelationship(
            id = "r1",
            workId = "w1",
            sourceCharacterId = "ch1",
            targetCharacterId = "ch2",
            relationType = "朋友"
        )
        dao.insertCharacterRelationship(relationship)

        val result = dao.getCharacterRelationshipById("r1")
        assertNotNull(result)
        assertEquals("朋友", result?.relationType)
    }

    @Test
    fun getCharacterRelationshipsByCharacterId() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "作品"))
        dao.insertCharacter(NovelCharacter(id = "ch1", workId = "w1", name = "角色1"))
        dao.insertCharacter(NovelCharacter(id = "ch2", workId = "w1", name = "角色2"))
        dao.insertCharacter(NovelCharacter(id = "ch3", workId = "w1", name = "角色3"))

        dao.insertCharacterRelationship(CharacterRelationship(
            id = "r1", workId = "w1",
            sourceCharacterId = "ch1", targetCharacterId = "ch2",
            relationType = "朋友"
        ))
        dao.insertCharacterRelationship(CharacterRelationship(
            id = "r2", workId = "w1",
            sourceCharacterId = "ch1", targetCharacterId = "ch3",
            relationType = "敌人"
        ))

        val relationships = dao.getCharacterRelationshipsByCharacterId("ch1").first()
        assertEquals(2, relationships.size)
    }

    // ==================== 事件测试 ====================

    @Test
    fun insertAndGetNovelEvent() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "作品"))
        val event = NovelEvent(id = "e1", workId = "w1", title = "开篇事件")
        dao.insertNovelEvent(event)

        val result = dao.getNovelEventById("e1")
        assertNotNull(result)
        assertEquals("开篇事件", result?.title)
    }

    @Test
    fun insertAndGetEventParticipant() = runTest {
        dao.insertWork(NovelWork(id = "w1", title = "作品"))
        dao.insertCharacter(NovelCharacter(id = "ch1", workId = "w1", name = "角色"))
        dao.insertNovelEvent(NovelEvent(id = "e1", workId = "w1", title = "事件"))

        val participant = NovelEventParticipant(id = "ep1", eventId = "e1", characterId = "ch1", role = "主角")
        dao.insertNovelEventParticipant(participant)

        val participants = dao.getNovelEventParticipantsByEventId("e1").first()
        assertEquals(1, participants.size)
        assertEquals("主角", participants[0].role)
    }
}
