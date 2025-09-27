package com.xiaoguai.agentx.application.conversation.service.agent.manager;


import com.xiaoguai.agentx.application.conversation.service.ChatContext;
import com.xiaoguai.agentx.domain.task.constants.TaskStatus;
import com.xiaoguai.agentx.domain.task.model.TaskEntity;
import com.xiaoguai.agentx.domain.task.service.TaskDomainService;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-15 18:10
 * @Description: 任务管理
 */
@Component
public class TaskManager {

    private final TaskDomainService taskDomainService;

    public TaskManager(TaskDomainService taskDomainService) {
        this.taskDomainService = taskDomainService;
    }

    /**
     * 创建父任务
     */
    public TaskEntity createParentTask(ChatContext context) {
        TaskEntity task = new TaskEntity();
        task.setParentTaskId("0");
        task.setTaskName(context.getUserMessage());
        task.setSessionId(context.getSessionId());
        task.setProgress(0);
        task.setStatus(TaskStatus.PROGRESSING);
        task.setStartTime(LocalDateTime.now());
        task.setUserId(UserContext.getUserId());
        taskDomainService.addTask(task);
        return task;
    }

    /**
     * 创建子任务
     */
    public TaskEntity createSubTask(String parentId, String taskName, ChatContext context) {
        TaskEntity task = new TaskEntity();
        task.setParentTaskId(parentId);
        task.setTaskName(taskName);
        task.setSessionId(context.getSessionId());
        task.setProgress(0);
        task.setStatus(TaskStatus.PROGRESSING);
        task.setStartTime(LocalDateTime.now());
        task.setUserId(UserContext.getUserId());
        taskDomainService.addTask(task);
        return task;
    }

    /**
     * 更新任务进度
     */
    public void updateTaskProgress(TaskEntity task, Integer completeTaskCount, Integer totalTaskCount) {
        int progress = (int)(completeTaskCount / (double)totalTaskCount) * 100;
        task.updateProgress(progress);
        taskDomainService.updateTask(task);
    }

    /**
     * 更新任务状态
     */
    public void updateTaskStatus(TaskEntity task, TaskStatus status) {
        task.setStatus(status);
        taskDomainService.updateTask(task);
    }

    /**
     * 完成任务
     */
    public void completeTask(TaskEntity task, String result) {
        task.setTaskResult(result);
        taskDomainService.updateTask(task);
    }
}
