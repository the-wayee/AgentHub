package com.xiaoguai.agentx.application.agent.service;


import com.xiaoguai.agentx.domain.agent.dto.AgentDTO;
import com.xiaoguai.agentx.domain.agent.service.AgentDomainService;
import com.xiaoguai.agentx.domain.agent.service.AgentWorkspaceDomainService;
import com.xiaoguai.agentx.domain.conversation.dto.SessionDTO;
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
        // 1.获取当前用户的所有助理
        List<AgentDTO> userAgents = agentDomainService.getUserAgents(userId, new SearchAgentsRequest());

        // 2.获取已添加到工作区的助理
        List<AgentDTO> workspaceAgents = agentWorkspaceDomainService.getWorkspaceAgents(userId);

        // 合并两个列表
        userAgents.addAll(workspaceAgents);
        return userAgents;
    }

    /**
     * 删除工作区的Agent
     */
    @Transactional
    public void deleteAgent(String agentId, String usrId) {
        boolean isDelete = agentWorkspaceDomainService.deleteAgent(agentId, usrId);
        if (!isDelete) {
            throw new BusinessException("删除Agent失败：", agentId);
        }

        // 查找出agent下的会话
        List<String> sessionIds = sessionDomainService.getSessionsByAgentId(agentId, usrId).stream().map(SessionDTO::getId).toList();

        // 删除会话
        sessionDomainService.deleteSessions(sessionIds);

        // 删除会话所有消息
        conversationDomainService.deleteConversationMessages(sessionIds);
    }

}
