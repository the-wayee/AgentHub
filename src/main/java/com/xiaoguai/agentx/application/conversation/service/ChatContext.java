package com.xiaoguai.agentx.application.conversation.service;


import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.xiaoguai.agentx.application.conversation.service.agent.template.AgentPromptTemplates;
import com.xiaoguai.agentx.domain.agent.model.AgentEntity;
import com.xiaoguai.agentx.domain.conversation.constants.Role;
import com.xiaoguai.agentx.domain.conversation.model.ContextEntity;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.llm.model.ModelEntity;
import com.xiaoguai.agentx.domain.llm.model.ProviderEntity;
import com.xiaoguai.agentx.domain.llm.model.config.LlmModelConfig;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.request.ChatRequestParameters;
import dev.langchain4j.model.openai.OpenAiChatRequestParameters;

import java.util.ArrayList;
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


    /**
     * 构建聊天请求
     */
    public ChatRequest prepareRequest() {

        List<ChatMessage> messages = new ArrayList<>();

        // 如果有摘要消息
        if (StringUtils.isNotBlank(this.getContextEntity().getSummary())) {
            messages.add(new AiMessage(AgentPromptTemplates.getSummaryPrefix() +  this.getContextEntity().getSummary()));
        }

        // 构建历史消息
        for (MessageEntity message : historyMessages) {
            if (message.getRole() == Role.USER) {
                messages.add(new UserMessage(message.getContent()));
            } else if (message.getRole() == Role.SYSTEM) {
                messages.add(new SystemMessage(message.getContent()));
            } else {
                messages.add(new AiMessage(message.getContent()));
            }
        }

        // 添加当前用户消息
        messages.add(new UserMessage(this.getUserMessage()));

        // 添加请求参数
        ChatRequestParameters parameters = OpenAiChatRequestParameters.builder()
                .modelName(this.getModelEntity().getModelId())
                .topK(this.getLlmModelConfig().getTopK())
                .topP(this.getLlmModelConfig().getTopP())
                .temperature(this.getLlmModelConfig().getTemperature())
                .build();


        return ChatRequest.builder()
                .messages(messages)
                .parameters(parameters)
                .build();
    }


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
