package com.xiaoguai.agentx.application.agent.service;


import com.xiaoguai.agentx.application.agent.assembler.AgentAssembler;
import com.xiaoguai.agentx.application.agent.dto.AgentDTO;
import com.xiaoguai.agentx.domain.agent.model.AgentEntity;
import com.xiaoguai.agentx.domain.agent.model.AgentWorkspaceEntity;
import com.xiaoguai.agentx.domain.agent.service.AgentDomainService;
import com.xiaoguai.agentx.domain.agent.service.AgentWorkspaceDomainService;
import com.xiaoguai.agentx.application.conversation.dto.SessionDTO;
import com.xiaoguai.agentx.domain.conversation.model.SessionEntity;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.domain.conversation.service.SessionDomainService;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.interfaces.dto.agent.SearchAgentsRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-02 17:17
 * @Description: AgentWorkspaceAppService
 */
@Service
public class AgentWorkspaceAppService {

    private final AgentWorkspaceDomainService agentWorkspaceDomainService;

    private final AgentDomainService agentDomainService;
    private final SessionDomainService sessionDomainService;
    private final ConversationDomainService conversationDomainService;

    public AgentWorkspaceAppService(AgentWorkspaceDomainService agentWorkspaceDomainService,
                                    AgentDomainService agentDomainService,
                                    SessionDomainService sessionDomainService,
                                    ConversationDomainService conversationDomainService) {
        this.agentWorkspaceDomainService = agentWorkspaceDomainService;
        this.agentDomainService = agentDomainService;
        this.sessionDomainService = sessionDomainService;
        this.conversationDomainService = conversationDomainService;
    }

    /**
     * 获取工作区下的所有Agent
     */
    public List<AgentDTO> getAgents(String userId) {


        // 2.获取已添加到工作区的助理
        List<AgentEntity> workspaceAgents = agentWorkspaceDomainService.getWorkspaceAgents(userId);

        return AgentAssembler.toDTOList(workspaceAgents);
    }

    /**
     * 添加Agent到Workspace
     */
    public AgentDTO addAgentToWorkspace(String agentId, String userId) {
        boolean exist = agentWorkspaceDomainService.checkAgentExistWorkspace(agentId, userId);
        if (exist) {
            throw new BusinessException("该助理已经存在工作区");
        }
        AgentEntity agent = agentDomainService.getAgentById(agentId);
        if (agent.getEnabled() == false) {
            throw new BusinessException("该助理已禁用");
        }
        AgentWorkspaceEntity workspaceEntity = new AgentWorkspaceEntity();
        workspaceEntity.setAgentId(agentId);
        workspaceEntity.setUserId(userId);
        agentWorkspaceDomainService.saveWorkspaceAgent(workspaceEntity);
        return AgentAssembler.toDTO(agent);
    }

    /**
     * 删除工作区的Agent
     */
    @Transactional
    public void deleteAgent(String agentId, String usrId) {
        AgentEntity agent = agentDomainService.getAgent(agentId, usrId);
        if (agent != null) {
            throw new BusinessException("不允许删除自己的助理");
        }

        boolean isDelete = agentWorkspaceDomainService.deleteAgent(agentId, usrId);
        if (!isDelete) {
            throw new BusinessException("删除Agent失败：", agentId);
        }

        // 查找出agent下的会话
        List<String> sessionIds = sessionDomainService.getSessionsByAgentId(agentId, usrId).stream().map(SessionEntity::getId).toList();

        // 删除会话所有消息
        conversationDomainService.deleteConversationMessages(sessionIds);

        // 删除会话
        sessionDomainService.deleteSessions(sessionIds);
    }

}
