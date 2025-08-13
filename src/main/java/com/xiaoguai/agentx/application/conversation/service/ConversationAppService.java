package com.xiaoguai.agentx.application.conversation.service;


import com.xiaoguai.agentx.application.conversation.dto.StreamChatRequest;
import com.xiaoguai.agentx.application.conversation.dto.StreamChatResponse;
import com.xiaoguai.agentx.domain.agent.model.AgentEntity;
import com.xiaoguai.agentx.domain.agent.model.AgentWorkspaceEntity;
import com.xiaoguai.agentx.domain.agent.service.AgentDomainService;
import com.xiaoguai.agentx.domain.agent.service.AgentWorkspaceDomainService;
import com.xiaoguai.agentx.domain.conversation.contants.Role;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.llm.model.ModelEntity;
import com.xiaoguai.agentx.domain.llm.model.ProviderEntity;
import com.xiaoguai.agentx.domain.llm.service.LlmDomainService;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.application.conversation.dto.MessageDTO;
import com.xiaoguai.agentx.domain.conversation.model.SessionEntity;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.domain.conversation.service.SessionDomainService;
import com.xiaoguai.agentx.infrastrcture.llm.LlmProviderService;
import com.xiaoguai.agentx.infrastrcture.llm.config.BaseProviderConfig;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
import dev.langchain4j.community.model.dashscope.QwenChatRequestParameters;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.request.ChatRequestParameters;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.PartialThinking;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.model.output.TokenUsage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-02 15:16
 * @Description: 对话应用服务，用于适配域层的对话服务
 */
@Service
public class ConversationAppService {

    private final static Logger logger = LoggerFactory.getLogger(ConversationAppService.class);

    private final ConversationDomainService conversationDomainService;
    private final SessionDomainService sessionDomainService;
    private final AgentDomainService agentDomainService;
    private final AgentWorkspaceDomainService agentWorkspaceDomainService;
    private final LlmDomainService llmDomainService;
    private final LlmProviderService llmProviderService;

    public ConversationAppService(ConversationDomainService conversationDomainService, SessionDomainService sessionDomainService, AgentDomainService agentDomainService, AgentWorkspaceDomainService agentWorkspaceDomainService, LlmDomainService llmDomainService, LlmProviderService llmProviderService) {
        this.conversationDomainService = conversationDomainService;
        this.sessionDomainService = sessionDomainService;
        this.agentDomainService = agentDomainService;
        this.agentWorkspaceDomainService = agentWorkspaceDomainService;
        this.llmDomainService = llmDomainService;
        this.llmProviderService = llmProviderService;
    }

    /**
     * 处理流式聊天请求
     */
    public SseEmitter chatStream(StreamChatRequest request, String userId) {
        // Sse发射器，超时时间5min
        SseEmitter emitter = new SseEmitter(300000L);

        // 获取会话
        String sessionId = request.getSessionId();
        String content = request.getMessage();

        // 获取会话
        SessionEntity session = sessionDomainService.getSession(sessionId, userId);
        String agentId = session.getAgentId();

        // 获取Agent
        AgentEntity agent = agentDomainService.getAgent(agentId, userId);
        if (!agent.getEnabled() && !agent.getUserId().equals(userId)) {
            throw new BusinessException("该助理不可用: " + agentId);
        }

        // 获取工作区Agent
        AgentWorkspaceEntity workspace = agentWorkspaceDomainService.getWorkspace(agentId, userId);

        // 获取model
        String modelId = workspace.getModelId();
        ModelEntity model = llmDomainService.getModelById(modelId);
        model.isActive(); //判断模型是否激活
        // 获取Provider信息
        String providerId = model.getProviderId();
        ProviderEntity provider = llmDomainService.getProviderById(providerId);
        // 协议
        ProviderProtocol protocol = provider.getProtocol();
        // 服务商配置
        BaseProviderConfig config = new BaseProviderConfig();
        config.setApiKey(provider.getConfig().getApiKey());
        config.setBaseUrl(provider.getConfig().getBaseUrl());
        config.setModel(model.getModelId());

        // 策略模式， 获取真实对话模型
        StreamingChatModel chatModel = llmProviderService.getStreamModel(protocol, config);



        // 准备用户消息
        MessageEntity userMessage = new MessageEntity();
        userMessage.setRole(Role.USER);
        userMessage.setContent(content);
        userMessage.setSessionId(sessionId);

        // 准备模型消息
        MessageEntity llmMessageEntity = new MessageEntity();
        llmMessageEntity.setRole(Role.ASSISTANT);
        llmMessageEntity.setSessionId(sessionId);
        llmMessageEntity.setModel(model.getModelId());
        llmMessageEntity.setProvider(provider.getId());

        // TODO 根据会话id准备上下文
        // 传入上下文
        UserMessage message = UserMessage.from(content);

        // 目前只有Qwen支持推理
        ChatRequestParameters parameters = QwenChatRequestParameters.builder()
                .enableThinking(request.getEnableThink())
                .build();

        ChatRequest chatRequest = ChatRequest.builder()
                .parameters(parameters)
                .messages(message)
                .build();
        chatModel.chat(chatRequest, new StreamingChatResponseHandler() {
            @Override
            public void onPartialResponse(String partialResponse) {
                try {
                    StreamChatResponse response = new StreamChatResponse();
                    response.setContent(partialResponse);
                    response.setSessionId(sessionId);
                    response.setDone(false);
                    response.setReasoning(false);
                    response.setProvider(provider.getName());
                    response.setModel(model.getModelId());

                    emitter.send(response);
                } catch (IOException e) {
                    logger.error("Llm响应失败: {}", e.getMessage());
                    throw new RuntimeException(e);
                }
            }

            @Override
            public void onCompleteResponse(ChatResponse completeResponse) {
                String aiMessage = completeResponse.aiMessage().text();
                TokenUsage tokenUsage = completeResponse.tokenUsage();
                llmMessageEntity.setContent(aiMessage);
                // 大模型回复消耗的Token
                llmMessageEntity.setTokenCount(tokenUsage.outputTokenCount());

                // 用户消息消耗的Token
                userMessage.setTokenCount(tokenUsage.inputTokenCount());

                try {
                    StreamChatResponse response = new StreamChatResponse();
                    response.setContent("");
                    response.setSessionId(sessionId);
                    response.setProvider(provider.getName());
                    response.setModel(model.getModelId());
                    response.setDone(true);
                    response.setReasoning(false);
                    emitter.send(response);
                    emitter.complete();
                } catch (IOException e) {
                    logger.error("Llm响应失败: {}", e.getMessage());
                    throw new RuntimeException(e);
                }
            }

            @Override
            public void onError(Throwable error) {
                try {
                    StreamChatResponse response = new StreamChatResponse();
                    response.setContent(error.getMessage());
                    response.setDone(true);
                    response.setReasoning(false);
                    emitter.send(response);
                    emitter.complete();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }

            // 目前Qwen模型的推理思考
            @Override
            public void onPartialThinking(PartialThinking partialThinking) {
                String think = partialThinking.text();
                try {
                    StreamChatResponse response = new StreamChatResponse();
                    response.setContent(think);
                    response.setSessionId(sessionId);
                    response.setProvider(provider.getName());
                    response.setModel(model.getModelId());
                    response.setDone(false);
                    response.setReasoning(true);
                    emitter.send(response);
                } catch (IOException e) {
                    logger.error("Llm响应失败: {}", e.getMessage());
                    throw new RuntimeException(e);
                }
            }
        });

        return emitter;
    }


    /**
     * 获取会话消息列表
     */
    public List<MessageDTO> getSessionMessages(String sessionId, String userId) {
        // 查询对应会话是否存在
        SessionEntity sessionEntity = sessionDomainService.find(sessionId, userId);

        if (sessionEntity == null) {
            throw new BusinessException("会话不存在");
        }

        return conversationDomainService.getConversationMessages(sessionId);
    }
}
