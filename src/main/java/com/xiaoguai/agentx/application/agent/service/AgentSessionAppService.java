package com.xiaoguai.agentx.application.agent.service;


import com.xiaoguai.agentx.domain.agent.dto.AgentDTO;
import com.xiaoguai.agentx.domain.agent.service.AgentDomainService;
import com.xiaoguai.agentx.domain.agent.service.AgentWorkspaceDomainService;
import com.xiaoguai.agentx.domain.conversation.dto.SessionDTO;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.domain.conversation.service.SessionDomainService;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.interfaces.dto.conversation.ConversationRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-02 15:35
 * @Description: Agent会话服务层
 */
@Service
public class AgentSessionAppService {

    private final AgentWorkspaceDomainService agentWorkspaceDomainService;

    private final AgentDomainService agentServiceDomainService;

    private final SessionDomainService sessionDomainService;

    private final ConversationDomainService conversationDomainService;

    public AgentSessionAppService(AgentWorkspaceDomainService agentWorkspaceDomainService,
                                  AgentDomainService agentServiceDomainService,
                                  SessionDomainService sessionDomainService,
                                  ConversationDomainService conversationDomainService) {
        this.agentWorkspaceDomainService = agentWorkspaceDomainService;
        this.agentServiceDomainService = agentServiceDomainService;
        this.sessionDomainService = sessionDomainService;
        this.conversationDomainService = conversationDomainService;
    }

    /**
     * 获取某个Agent下的会话列表
     */
    public List<SessionDTO> getAgentSessions(String agentId, String userId) {
        // 校验该 agent 是否被添加了工作区，判断条件：是否是自己的助理 or 在工作区中
        boolean b = agentServiceDomainService.checkAgentExist(agentId, userId);
        boolean b1 = agentWorkspaceDomainService.checkAgentWorkspaceExist(agentId, userId);

        if (!b && !b1) {
            throw new BusinessException("助理不存在");
        }
        // 获取会话列表
        List<SessionDTO> sessions = sessionDomainService.getSessionsByAgentId(agentId, userId);
        if (sessions.isEmpty()) {
            // 如果没有会话列表，创建一个
            SessionDTO session = this.createSession(agentId, userId);
            return Collections.singletonList(session);
        }
        return sessions;
    }

    /**
     * 创建会话
     */
    @Transactional
    public SessionDTO createSession(String agentId, String userId) {
        // 创建会话
        SessionDTO session = sessionDomainService.createSession(agentId, userId);
        // 获取Agent
        AgentDTO agent = agentServiceDomainService.getAgentWithPermissionCheck(agentId, userId);
        String welcomeMessage = agent.getWelcomeMessage();
        conversationDomainService.saveAssistantMessage(session.getId(), welcomeMessage, "", "", 0);
        return session;
    }

    /**
     * 更新会话
     *
     * @param id     会话id
     * @param userId 用户id
     * @param title  标题
     */
    @Transactional
    public void updateSession(String id, String userId, String title) {
        sessionDomainService.updateSession(id, userId, title);
    }

    /**
     * 删除会话
     *
     * @param id 会话id
     */
    @Transactional
    public void deleteSession(String id, String userId) {
        // 删除会话下的消息
        conversationDomainService.deleteConversationMessages(id);
        boolean deleteSession = sessionDomainService.deleteSession(id, userId);
        if (!deleteSession){
            throw new BusinessException("删除会话失败");
        }
    }

    /**
     * 发送消息
     *
     * @param id 会话id
     * @param userId 用户id
     * @param conversationRequest 会话请求
     */
    public void sendMessage(String id, String userId, ConversationRequest conversationRequest) {

        // todo 目前先普通的发送消息，后续还需要根据 agent 的记忆策略，对话助手/agent 策略进行处理

//        // 查询会话是否存在,根据id和userid
//        String agentId = conversationRequest.getAgentId();
//        AgentDTO agent = agentServiceDomainService.getAgent(agentId, userId);
//
//        // todo 目前是模型名称，后续需要换为模型 id
//        ModelConfig modelConfig = agent.getModelConfig();
//        if (StringUtils.isEmpty(modelConfig.getModelName())){
//            throw new BusinessException("模型为空");
//        }
//
//        // todo 目前硬编码模型服务商，后续需要根据不同的服务商进行发送消息
//        conversationDomainService.sendMessage(id, userId, conversationRequest.getMessage(),
//                modelConfig.getModelName());
    }
}
