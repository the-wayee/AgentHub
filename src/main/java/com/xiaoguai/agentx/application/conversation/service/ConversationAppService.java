package com.xiaoguai.agentx.application.conversation.service;


import com.xiaoguai.agentx.application.conversation.dto.MessageDTO;
import com.xiaoguai.agentx.application.conversation.dto.StreamChatRequest;
import com.xiaoguai.agentx.domain.agent.model.AgentEntity;
import com.xiaoguai.agentx.domain.agent.model.AgentWorkspaceEntity;
import com.xiaoguai.agentx.domain.agent.service.AgentDomainService;
import com.xiaoguai.agentx.domain.agent.service.AgentWorkspaceDomainService;
import com.xiaoguai.agentx.domain.conversation.factory.MessageHandlerFactory;
import com.xiaoguai.agentx.domain.conversation.handler.ChatEnvironment;
import com.xiaoguai.agentx.domain.conversation.handler.MessageHandler;
import com.xiaoguai.agentx.domain.conversation.model.ContextEntity;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.model.SessionEntity;
import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.domain.conversation.service.MessageDomainService;
import com.xiaoguai.agentx.domain.conversation.service.SessionDomainService;
import com.xiaoguai.agentx.domain.llm.model.ModelEntity;
import com.xiaoguai.agentx.domain.llm.model.ProviderEntity;
import com.xiaoguai.agentx.domain.llm.model.config.LlmModelConfig;
import com.xiaoguai.agentx.domain.llm.service.LlmDomainService;
import com.xiaoguai.agentx.domain.token.model.TokenMessage;
import com.xiaoguai.agentx.domain.token.model.TokenProcessResult;
import com.xiaoguai.agentx.domain.token.model.config.TokenOverflowConfig;
import com.xiaoguai.agentx.domain.token.model.enums.TokenOverflowStrategyEnum;
import com.xiaoguai.agentx.domain.token.service.TokenDomainService;
import com.xiaoguai.agentx.domain.token.service.TokenOverflowStrategyFactory;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.llm.LlmProviderService;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransportFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;

import static com.xiaoguai.agentx.domain.token.model.enums.TokenOverflowStrategyEnum.SUMMARIZE;

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
    private final ContextDomainService contextDomainService;
    private final AgentDomainService agentDomainService;
    private final AgentWorkspaceDomainService agentWorkspaceDomainService;
    private final LlmDomainService llmDomainService;
    private final MessageDomainService messageDomainService;
    private final TokenDomainService tokenDomainService;
    private final MessageHandlerFactory messageHandlerFactory;
    public ConversationAppService(ConversationDomainService conversationDomainService,
                                  SessionDomainService sessionDomainService,
                                  ContextDomainService contextDomainService,
                                  AgentDomainService agentDomainService,
                                  AgentWorkspaceDomainService agentWorkspaceDomainService,
                                  LlmDomainService llmDomainService,
                                  MessageDomainService messageDomainService, TokenDomainService tokenDomainService, MessageHandlerFactory messageHandlerFactory) {
        this.conversationDomainService = conversationDomainService;
        this.sessionDomainService = sessionDomainService;
        this.contextDomainService = contextDomainService;
        this.agentDomainService = agentDomainService;
        this.agentWorkspaceDomainService = agentWorkspaceDomainService;
        this.llmDomainService = llmDomainService;
        this.messageDomainService = messageDomainService;
        this.tokenDomainService = tokenDomainService;
        this.messageHandlerFactory = messageHandlerFactory;
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

    /**
     * 处理流式聊天请求
     */
    public SseEmitter chatStream(StreamChatRequest request, String userId) {
        // 准备对话环境
        ChatEnvironment environment = prepareChatEnvironment(request, userId);
        // 获取传输方式
        MessageTransport<SseEmitter> transport = MessageTransportFactory.getTransport(MessageTransportFactory.TRANSPORT_TYPE_SSE);
        // 获取消息处理器
        MessageHandler handler = messageHandlerFactory.getMessageHandler(environment.getAgentEntity());
        // 处理聊天
        return handler.handleChat(environment, transport);
    }

    /**
     * 准备对话环境
     *
     * @param request 聊天请求
     * @param userId  用户id
     * @return 对话环境
     */
    private ChatEnvironment prepareChatEnvironment(StreamChatRequest request, String userId) {
        String sessionId = request.getSessionId();
        ChatEnvironment environment = new ChatEnvironment();
        environment.setSessionId(sessionId);
        environment.setUserMessage(request.getMessage());
        environment.setUserId(userId);
        // 获取会话
        SessionEntity session = sessionDomainService.getSession(sessionId, userId);

        // 获取Agent实例
        String agentId = session.getAgentId();
        AgentEntity agent = agentDomainService.getAgentById(agentId, userId);
        environment.setAgentEntity(agent);

        // 获取工作区模型配置
        AgentWorkspaceEntity workspace = agentWorkspaceDomainService.getWorkspace(agentId, userId);
        LlmModelConfig llmModelConfig = workspace.getLlmModelConfig();
        llmModelConfig.setEnableSearch(request.getEnableSearch());
        llmModelConfig.setEnableThinking(request.getEnableThink());
        environment.setLlmModelConfig(llmModelConfig);


        // 获取模型
        ModelEntity model = llmDomainService.getModelById(llmModelConfig.getModelId());
        model.isActive();
        environment.setModelEntity(model);

        // 获取服务商
        ProviderEntity provider = llmDomainService.getProviderById(model.getProviderId());
        environment.setProviderEntity(provider);

        // 准备上下文，使用Token上下文策略
        setupContext(environment);

        return environment;
    }


    /**
     * 准备上下文环境，根据上下文策略，使用滑动窗口or摘要算法
     * @param environment 上下文环境
     */
    private void setupContext(ChatEnvironment environment) {
        // 获取上下文
        ContextEntity context = contextDomainService.findBySessionId(environment.getSessionId());
        List<MessageEntity> historyMessages = new ArrayList<>();
        if (context != null) {
            // 获取活跃消息
            List<String> activeMessageIds = context.getActiveMessages();
            List<MessageEntity> activeMessages = messageDomainService.listByIds(activeMessageIds);
            applyTokenOverflowStrategy(environment, context, activeMessages);
        } else {
            // 创建新的上下文
            context = new ContextEntity();
            context.setSessionId(environment.getSessionId());
            context.setActiveMessages(new ArrayList<>());
        }

        environment.setHistoryMessages(historyMessages);
        environment.setContextEntity(context);
    }

    /**
     * 应用Token溢出策略
     * @param environment 对话环境
     * @param context 上下文
     * @param activeMessages 活跃消息列表
     */
    public void applyTokenOverflowStrategy(ChatEnvironment environment, ContextEntity context, List<MessageEntity> activeMessages) {
        LlmModelConfig llmModelConfig = environment.getLlmModelConfig();
        // 转换成Token消息
        List<TokenMessage> tokenMessages = tokenizeMessages(activeMessages);

        // 组装Token配置项
        TokenOverflowConfig tokenOverflowConfig = new TokenOverflowConfig();
        tokenOverflowConfig.setStrategyType(llmModelConfig.getStrategyType());
        tokenOverflowConfig.setMaxTokens(llmModelConfig.getMaxTokens());
        tokenOverflowConfig.setReserveRatio(llmModelConfig.getReserveRatio());
        tokenOverflowConfig.setSummaryThreshold(llmModelConfig.getSummaryThreshold());

        // 使用策略处理消息
        TokenProcessResult result = tokenDomainService.processMessages(tokenMessages, tokenOverflowConfig);

        // 更新上下文
        if (result.isProcessed()) {
            List<String> retainedMessageIds = result.getRetainedMessages()
                    .stream()
                    .map(TokenMessage::getId)
                    .toList();

            // 摘要策略
            if (llmModelConfig.getStrategyType() == SUMMARIZE) {
                String oldSummary = context.getSummary();
                String newSummary = result.getSummary();
                context.setSummary(oldSummary + newSummary);
            }

            context.setActiveMessages(retainedMessageIds);
        }

    }

    public List<TokenMessage> tokenizeMessages(List<MessageEntity> activeMessages) {
        return activeMessages.stream()
                .map(message -> {
                    TokenMessage tokenMessage = new TokenMessage();
                    tokenMessage.setId(message.getId());
                    tokenMessage.setContent(message.getContent());
                    tokenMessage.setRole(message.getRole().name());
                    tokenMessage.setTokenCount(message.getTokenCount());
                    tokenMessage.setCreatedAt(message.getCreatedAt());
                    return tokenMessage;
                }).toList();
    }
}
