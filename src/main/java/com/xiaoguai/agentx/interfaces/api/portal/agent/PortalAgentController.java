package com.xiaoguai.agentx.interfaces.api.portal.agent;


import com.xiaoguai.agentx.application.agent.service.AgentAppService;
import com.xiaoguai.agentx.domain.agent.model.AgentDTO;
import com.xiaoguai.agentx.domain.agent.model.AgentVersionDTO;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.agent.CreateAgentRequest;
import com.xiaoguai.agentx.interfaces.dto.agent.PublishAgentVersionRequest;
import com.xiaoguai.agentx.interfaces.dto.agent.SearchAgentRequest;
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
     * 创建新的Agent
     */
    @PostMapping
    public Result<AgentDTO> createAgent(@RequestBody CreateAgentRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(agentAppService.createAgent(request, userId));
    }

    /**
     * 更新Agent信息
     *
     * @param request 请求体
     * @param agentId agentId
     */
    @PutMapping("/{agentId}")
    public Result<AgentDTO> updateAgent(@PathVariable String agentId,
                                        @RequestBody UpdateAgentRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(agentAppService.updateAgent(agentId, request, userId));
    }

    /**
     * 获取Agent信息
     */
    @GetMapping("/{agentId}")
    public Result<AgentDTO> getAgent(@PathVariable String agentId) {
        String userId = UserContext.getUserId();
        return Result.success(agentAppService.getAgent(agentId, userId));
    }

    /**
     * 获取用户Agent列表
     */
    @GetMapping("/user")
    public Result<List<AgentDTO>> getUserAgents(SearchAgentRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(agentAppService.getUserAgents(request, userId));
    }

    /**
     * 发布Agent版本
     */
    @PostMapping("/{agentId}/publish")
    public Result<AgentVersionDTO> publishAgentVersion(@PathVariable String agentId,
                                                       @RequestBody PublishAgentVersionRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(agentAppService.publishAgentVersion(agentId, request, userId));
    }

    /**
     * 获取已经上架的 Agents - 名称模糊查询
     */
    @GetMapping("/publish")
    public Result<List<AgentVersionDTO>> getPublishedAgents(SearchAgentRequest request) {
        return Result.success(agentAppService.getPublishedAgents(request));
    }

}
