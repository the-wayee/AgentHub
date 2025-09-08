package com.xiaoguai.agentx.interfaces.api.portal.agent;


import com.xiaoguai.agentx.application.task.service.TaskAppService;
import com.xiaoguai.agentx.domain.task.model.TaskAggregate;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-08 17:25
 * @Description: TaskController
 */
@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskAppService taskAppService;

    public TaskController(TaskAppService taskAppService) {
        this.taskAppService = taskAppService;
    }

    @GetMapping("/session/{sessionId}/latest")
    public Result<TaskAggregate> getCurrentSessionTask(@PathVariable String sessionId) {
        String userId = UserContext.getUserId();
        return Result.success(taskAppService.getCurrentSessionTask(sessionId, userId));
    }
}
