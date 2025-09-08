package com.xiaoguai.agentx.domain.task.service;


import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.domain.task.model.TaskAggregate;
import com.xiaoguai.agentx.domain.task.model.TaskEntity;
import com.xiaoguai.agentx.domain.task.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-08 11:41
 * @Description: 任务领域服务层
 */
@Service
public class TaskDomainService {

    private final TaskRepository taskRepository;

    public TaskDomainService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * 新增任务
     *
     * @param taskEntity 任务实体
     * @return 更新后的任务实体
     */
    public TaskEntity addTask(TaskEntity taskEntity) {
        taskEntity.setStartTime(LocalDateTime.now());
        taskRepository.checkInsert(taskEntity);
        return taskEntity;
    }

    /**
     * 更新任务
     *
     * @param taskEntity 任务实体
     * @return 更新后的任务实体
     */
    public TaskEntity updateTask(TaskEntity taskEntity) {
        taskRepository.checkUpdateById(taskEntity);
        return taskEntity;
    }


    /**
     * 获取当前会话最新任务
     *
     * @param sessionId 会话id
     * @param userId    用户id
     */
    public TaskAggregate getCurrentSessionTask(String sessionId, String userId) {
        TaskEntity taskEntity = taskRepository.selectOne(Wrappers.<TaskEntity>lambdaQuery()
                .eq(TaskEntity::getSessionId, sessionId)
                .eq(TaskEntity::getUserId, userId)
                .eq(TaskEntity::getParentTaskId, "0")
                .orderByDesc(TaskEntity::getCreatedAt)
                .last("limit 1"));
        List<TaskEntity> subTasks = getSubTasks(taskEntity.getId());
        return new TaskAggregate(taskEntity, subTasks);
    }


    /**
     * 获取子任务列表
     *
     * @param parentTaskId 父任务id
     */
    public List<TaskEntity> getSubTasks(String parentTaskId) {
        return taskRepository.selectList(Wrappers.<TaskEntity>lambdaQuery()
                .eq(TaskEntity::getParentTaskId, parentTaskId));
    }
}
