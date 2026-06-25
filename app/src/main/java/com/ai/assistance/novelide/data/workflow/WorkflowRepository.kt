package com.ai.assistance.novelide.data.workflow

import kotlinx.coroutines.flow.Flow

class WorkflowRepository(private val dao: WorkflowDao) {

    fun getAll(): Flow<List<WorkflowEntity>> = dao.getAll()

    suspend fun getById(id: String): WorkflowEntity? = dao.getById(id)

    suspend fun create(name: String, description: String): WorkflowEntity {
        val entity = WorkflowEntity(
            name = name,
            description = description
        )
        dao.insert(entity)
        return entity
    }

    suspend fun insert(entity: WorkflowEntity) = dao.insert(entity)

    suspend fun update(entity: WorkflowEntity) =
        dao.update(entity.copy(updatedAt = System.currentTimeMillis()))

    suspend fun delete(id: String) = dao.delete(id)
}
