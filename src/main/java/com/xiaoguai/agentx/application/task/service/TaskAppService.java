package com.xiaoguai.agentx.application.task.service;


import com.xiaoguai.agentx.domain.task.model.TaskAggregate;
import com.xiaoguai.agentx.domain.task.service.TaskDomainService;
import org.springframework.stereotype.Service;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-08 13:40
 * @Description: TaskAppService
 */
@Service
public class TaskAppService {

    private final TaskDomainService taskDomainService;

    public TaskAppService(TaskDomainService taskDomainService) {
        this.taskDomainService = taskDomainService;
    }

    /**
     * 获取当前会话最新任务
     *
     * @param sessionId 会话id
     * @param userId    用户id
     */
    public TaskAggregate getCurrentSessionTask(String sessionId, String userId) {
        return taskDomainService.getCurrentSessionTask(sessionId, userId);
    }

}
