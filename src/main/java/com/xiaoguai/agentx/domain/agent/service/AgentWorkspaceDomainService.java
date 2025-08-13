package com.xiaoguai.agentx.domain.agent.service;


import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.application.agent.assembler.AgentAssembler;
import com.xiaoguai.agentx.application.agent.dto.AgentDTO;
import com.xiaoguai.agentx.domain.agent.model.AgentEntity;
import com.xiaoguai.agentx.domain.agent.model.AgentWorkspaceEntity;
import com.xiaoguai.agentx.domain.agent.repository.AgentRepository;
import com.xiaoguai.agentx.domain.agent.repository.AgentWorkspaceRepository;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-02 15:50
 * @Description: AgentWorkspaceService
 */
@Service
public class AgentWorkspaceDomainService {

    private final AgentWorkspaceRepository agentWorkspaceRepository;

    private final AgentRepository agentRepository;

    public AgentWorkspaceDomainService(AgentWorkspaceRepository agentWorkspaceRepository, AgentRepository agentRepository) {
        this.agentWorkspaceRepository = agentWorkspaceRepository;
        this.agentRepository = agentRepository;
    }

    /**
     * 获取工作区Agents
     */
    public List<AgentDTO> getWorkspaceAgents(String userId) {
        List<String> agentIds = agentWorkspaceRepository
                .selectList(Wrappers.<AgentWorkspaceEntity>
                                lambdaQuery().eq(AgentWorkspaceEntity::getUserId, userId)
                        .select(AgentWorkspaceEntity::getAgentId))
                .stream()
                .map(AgentWorkspaceEntity::getAgentId)
                .toList();

        if (agentIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<AgentEntity> agents = agentRepository.selectBatchIds(agentIds);
        return agents.stream().map(AgentAssembler::toDTO).toList();
    }

    /**
     * 获取工作区信息
     */
    public AgentWorkspaceEntity getWorkspace(String agentId, String userId) {
        AgentWorkspaceEntity agentWorkspace = agentWorkspaceRepository.selectOne(Wrappers.<AgentWorkspaceEntity>lambdaQuery()
                .eq(AgentWorkspaceEntity::getAgentId, agentId)
                .eq(AgentWorkspaceEntity::getUserId, userId));
        if (agentWorkspace == null) {
            throw new BusinessException("助理不存在");
        }
        return agentWorkspace;
    }

    /**
     * 保存Agent到工作区
     */
    public AgentWorkspaceEntity saveWorkspaceAgent(AgentWorkspaceEntity agentWorkspace) {
        int insert = agentWorkspaceRepository.insert(agentWorkspace);
        if (insert == 0) {
            throw new BusinessException("保存助理到工作区失败");
        }
        return agentWorkspace;

    }

    /**
     * 判断工作区是否存在agent
     */
    public boolean checkAgentWorkspaceExist(String agentId, String userId) {
        return agentWorkspaceRepository
                .selectCount(Wrappers.<AgentWorkspaceEntity>lambdaQuery()
                        .eq(AgentWorkspaceEntity::getAgentId, agentId)
                        .eq(AgentWorkspaceEntity::getUserId, userId)) > 0;

    }

    /**
     * 删除agent
     */
    public boolean deleteAgent(String agentId, String userId) {
        return agentWorkspaceRepository.delete(Wrappers.<AgentWorkspaceEntity>lambdaQuery()
                .eq(AgentWorkspaceEntity::getAgentId, agentId)
                .eq(AgentWorkspaceEntity::getUserId, userId)) > 0;
    }
}
