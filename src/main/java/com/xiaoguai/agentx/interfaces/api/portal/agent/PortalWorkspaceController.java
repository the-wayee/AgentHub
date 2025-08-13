package com.xiaoguai.agentx.interfaces.api.portal.agent;


import com.xiaoguai.agentx.application.agent.dto.AgentDTO;
import com.xiaoguai.agentx.application.agent.service.AgentWorkspaceAppService;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-10 00:23
 * @Description: PortalWorkspaceController
 */
@Validated
@RestController
@RequestMapping("/agent/workspace")
public class PortalWorkspaceController {

    private final AgentWorkspaceAppService agentWorkspaceAppService;

    public PortalWorkspaceController(AgentWorkspaceAppService agentWorkspaceAppService) {
        this.agentWorkspaceAppService = agentWorkspaceAppService;
    }

    /**
     * 获取工作区下的助理列表
     */
    @GetMapping("/agents")
    public Result<List<AgentDTO>> getAgents() {
        String userId = UserContext.getUserId();
        return Result.success(agentWorkspaceAppService.getAgents(userId));
    }

    /**
     * 添加Agent到工作区
     */
    @PostMapping("/{agentId}")
    public Result<AgentDTO> addToWorkspace(@PathVariable String agentId) {
        String userId = UserContext.getUserId();
        return Result.success(agentWorkspaceAppService.addAgentToWorkspace(agentId, userId));
    }

    /**
     * 删除工作区Agent
     */
    @DeleteMapping("/agents/{id}")
    public Result<Void> deleteAgent(@PathVariable String id) {
        String userId = UserContext.getUserId();
        agentWorkspaceAppService.deleteAgent(id, userId);
        return Result.success();
    }

}
