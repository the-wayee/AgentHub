package com.xiaoguai.agentx.domain.task.service;


import com.xiaoguai.agentx.domain.task.repository.TaskRepository;
import org.springframework.stereotype.Service;

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
}
