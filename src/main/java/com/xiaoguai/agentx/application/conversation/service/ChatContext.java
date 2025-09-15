package com.xiaoguai.agentx.application.conversation.service;


import com.xiaoguai.agentx.domain.agent.model.AgentEntity;
import com.xiaoguai.agentx.domain.conversation.model.ContextEntity;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.llm.model.ModelEntity;
import com.xiaoguai.agentx.domain.llm.model.ProviderEntity;
import com.xiaoguai.agentx.domain.llm.model.config.LlmModelConfig;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 10:22
 * @Description: 对话环境
 */
public class ChatContext {

    /**
     * 会话Id
     */
    private String sessionId;

    /**
     * 用户Id
     */
    private String userId;

    /**
     * 用户消息
     */
    private String userMessage;

    /**
     * Agent实体
     */
    private AgentEntity agentEntity;

    /**
     * 提供商实体
     */
    private ProviderEntity providerEntity;

    /**
     * 模型实体
     */
    private ModelEntity modelEntity;

    /**
     * 模型配置
     */
    private LlmModelConfig llmModelConfig;

    /**
     * 上下文实体
     */
    private ContextEntity contextEntity;

    /**
     * 历史消息
     */
    private List<MessageEntity> historyMessages;

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public AgentEntity getAgentEntity() {
        return agentEntity;
    }

    public void setAgentEntity(AgentEntity agentEntity) {
        this.agentEntity = agentEntity;
    }

    public ProviderEntity getProviderEntity() {
        return providerEntity;
    }

    public void setProviderEntity(ProviderEntity providerEntity) {
        this.providerEntity = providerEntity;
    }

    public ModelEntity getModelEntity() {
        return modelEntity;
    }

    public void setModelEntity(ModelEntity modelEntity) {
        this.modelEntity = modelEntity;
    }

    public ContextEntity getContextEntity() {
        return contextEntity;
    }

    public void setContextEntity(ContextEntity contextEntity) {
        this.contextEntity = contextEntity;
    }

    public List<MessageEntity> getHistoryMessages() {
        return historyMessages;
    }

    public void setHistoryMessages(List<MessageEntity> historyMessages) {
        this.historyMessages = historyMessages;
    }

    public LlmModelConfig getLlmModelConfig() {
        return llmModelConfig;
    }

    public void setLlmModelConfig(LlmModelConfig llmModelConfig) {
        this.llmModelConfig = llmModelConfig;
    }
}
