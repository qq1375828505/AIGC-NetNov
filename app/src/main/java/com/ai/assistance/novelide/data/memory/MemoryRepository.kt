package com.ai.assistance.novelide.data.memory

import kotlinx.coroutines.flow.Flow

class MemoryRepository(private val dao: MemoryDao) {

    fun getAll(): Flow<List<MemoryEntity>> = dao.getAll()

    suspend fun getById(id: String): MemoryEntity? = dao.getById(id)

    suspend fun create(content: String, title: String, importance: Int): MemoryEntity {
        val entity = MemoryEntity(
            content = content,
            title = title,
            importance = importance.coerceIn(1, 5)
        )
        dao.insert(entity)
        return entity
    }

    suspend fun insert(entity: MemoryEntity) = dao.insert(entity)

    suspend fun update(entity: MemoryEntity) =
        dao.update(entity.copy(updatedAt = System.currentTimeMillis()))

    suspend fun delete(id: String) = dao.delete(id)

    suspend fun search(q: String): List<MemoryEntity> {
        val pattern = "%${q}%"
        return dao.search(pattern)
    }
}
