package com.xiaoguai.agentx.interfaces.api.portal.agent;


import com.xiaoguai.agentx.application.agent.service.AgentAppService;
import com.xiaoguai.agentx.domain.agent.dto.AgentDTO;
import com.xiaoguai.agentx.domain.agent.dto.AgentVersionDTO;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.agent.CreateAgentRequest;
import com.xiaoguai.agentx.interfaces.dto.agent.PublishAgentVersionRequest;
import com.xiaoguai.agentx.interfaces.dto.agent.SearchAgentsRequest;
import com.xiaoguai.agentx.interfaces.dto.agent.UpdateAgentRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-30 15:22
 * @Description: Agent管理控制器
 */
@RestController
@RequestMapping("/agent")
public class PortalAgentController {

    private final AgentAppService agentAppService;

    public PortalAgentController(AgentAppService agentAppService) {
        this.agentAppService = agentAppService;
    }

    /**
     * 创建Agent
     */
    @PostMapping
    public Result<AgentDTO> createAgent(@RequestBody CreateAgentRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(agentAppService.createAgent(request, userId));
    }

    /**
     * 获取Agent
     */
    @GetMapping("/{agentId}")
    public Result<AgentDTO> getAgent(@PathVariable String agentId) {
        String userId = UserContext.getUserId();
        return Result.success(agentAppService.getAgent(agentId, userId));
    }

    /**
     * 更新Agent
     */
    @PutMapping("/{agentId}")
    public Result<Void> updateAgent(@PathVariable String agentId,
                                    @RequestBody UpdateAgentRequest request) {
        String userId = UserContext.getUserId();
        agentAppService.updateAgent(agentId, request, userId);
        return Result.success();
    }

    /**
     * 删除Agent
     */
    @DeleteMapping("/{agentId}")
    public Result<Void> deleteAgent(@PathVariable String agentId) {
        String userId = UserContext.getUserId();
        agentAppService.deleteAgent(agentId, userId);
        return Result.success();
    }

    /**
     * 获取Agent列表，支持状态和名称过滤
     */
    @GetMapping("/user")
    public Result<List<AgentDTO>> getUserAgents(SearchAgentsRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(agentAppService.getUserAgents(userId, request));
    }

    /**
     * 获取已上架的Agent列表，支持名称搜索
     */
    @GetMapping("/published")
    public Result<List<AgentVersionDTO>> getPublishedAgents(SearchAgentsRequest request) {
        return Result.success(agentAppService.getPublishedAgentsByName(request));
    }


    /**
     * 发布Agent版本
     */
    @PostMapping("/{agentId}/publish")
    public Result<AgentVersionDTO> publishAgentVersion(@PathVariable String agentId,
                                                       @RequestBody PublishAgentVersionRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(agentAppService.publishAgentVersion(agentId, request,userId));
    }

    /**
     * 获取Agent的所有版本
     */
    @GetMapping("/{agentId}/versions")
    public Result<List<AgentVersionDTO>> getAgentVersions(@PathVariable String agentId) {
        String userId = UserContext.getUserId();
        return Result.success(agentAppService.getAgentVersions(agentId, userId));
    }

    /**
     * 获取Agent的特定版本
     */
    @GetMapping("/{agentId}/versions/{versionNumber}")
    public Result<AgentVersionDTO> getAgentVersion(@PathVariable String agentId,
                                                   @PathVariable String versionNumber) {
        return Result.success(agentAppService.getAgentVersion(agentId, versionNumber));
    }

    /**
     * 获取Agent的最新版本
     */
    @GetMapping("/{agentId}/versions/latest")
    public Result<AgentVersionDTO> getLatestAgentVersion(@PathVariable String agentId) {
        return Result.success(agentAppService.getLatestAgentVersion(agentId));
    }
}
