package com.xiaoguai.agentx.application.agent.service;


import com.xiaoguai.agentx.application.agent.assembler.AgentAssembler;
import com.xiaoguai.agentx.domain.agent.model.AgentDTO;
import com.xiaoguai.agentx.domain.agent.model.AgentVersionDTO;
import com.xiaoguai.agentx.domain.agent.model.entity.AgentEntity;
import com.xiaoguai.agentx.domain.agent.model.entity.AgentVersionEntity;
import com.xiaoguai.agentx.domain.agent.service.AgentService;
import com.xiaoguai.agentx.domain.common.exception.ParamValidationException;
import com.xiaoguai.agentx.domain.common.utils.ValidationUtils;
import com.xiaoguai.agentx.interfaces.dto.agent.CreateAgentRequest;
import com.xiaoguai.agentx.interfaces.dto.agent.PublishAgentVersionRequest;
import com.xiaoguai.agentx.interfaces.dto.agent.SearchAgentRequest;
import com.xiaoguai.agentx.interfaces.dto.agent.UpdateAgentRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-30 15:20
 * @Description: Agent应用服务
 */
@Service
public class AgentAppService {

    private final AgentService agentService;

    public AgentAppService(AgentService agentService) {
        this.agentService = agentService;
    }


    /**
     * 创建新的Agent
     *
     * @param request 请求参数
     */
    @Transactional
    public AgentDTO createAgent(CreateAgentRequest request, String userId) {
        // 请求参数校验
        request.validate();

        AgentEntity entity = AgentAssembler.toEntity(request, userId);
        // 创建Agent
        return agentService.createAgent(entity);
    }

    /**
     * 更新Agent信息
     */
    public AgentDTO updateAgent(String agentId, UpdateAgentRequest request, String userId) {
        AgentEntity entity = AgentAssembler.toEntity(request, userId);

        // 更新
        return agentService.updateAgent(agentId, entity);
    }

    /**
     * 获取Agent
     */
    public AgentDTO getAgent(String agentId, String userId) {
        return agentService.getAgent(agentId, userId);
    }

    /**
     * 获取用户Agent列表 - 模糊查询
     */
    public List<AgentDTO> getUserAgents(SearchAgentRequest request, String userId) {
        return agentService.getUserAgents(userId, request.getName());
    }

    /**
     * 发布Agent版本
     */
    public AgentVersionDTO publishAgentVersion(String agentId, PublishAgentVersionRequest request, String userId) {
        request.validate();

        // 获取最新版本号
        AgentVersionDTO latestVersion = agentService.getAgentLatestVersion(agentId);

        // 获取当前Agent
        AgentDTO currentAgentDto = agentService.getAgent(agentId, userId);
        if (latestVersion != null && !request.getVersionNumber().isBlank()) {
            // 检查版本号是否大于上一个版本
            if (!request.isVersionGreaterThan(latestVersion.getVersionNumber())) {
                throw new ParamValidationException("versionNumber",
                        "新版本号(" + request.getVersionNumber() +
                                ")必须大于当前最新版本号(" + latestVersion.getVersionNumber() + ")");
            }
        }
        AgentVersionEntity versionEntity = AgentAssembler.createVersionEntity(currentAgentDto.toEntity(), request);
        return agentService.publishAgentVersion(agentId, versionEntity);
    }

    public List<AgentVersionDTO> getPublishedAgents(SearchAgentRequest request) {
        return new ArrayList<>();
    }
}
