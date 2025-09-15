package com.xiaoguai.agentx.application.conversation.service.chat;


import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.xiaoguai.agentx.application.conversation.dto.AgentChatResponse;
import com.xiaoguai.agentx.application.conversation.service.AbstractMessageHandler;
import com.xiaoguai.agentx.application.conversation.service.ChatContext;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import com.xiaoguai.agentx.domain.conversation.constants.Role;
import com.xiaoguai.agentx.domain.conversation.factory.MessageFactory;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.infrastrcture.llm.LlmProviderService;
import com.xiaoguai.agentx.infrastrcture.llm.factory.LlmRequestParameterFactory;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.request.ChatRequestParameters;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.PartialThinking;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.model.output.TokenUsage;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 10:31
 * @Description: 聊天类型消息处理
 */
@Component
public class ChatMessageHandler extends AbstractMessageHandler {

    /**
     * 默认连接超时时间：5min
     */
    protected static final long CONNECTION_TIMEOUT = 300000L;

    /**
     * 摘要前缀信息
     */
    private static final String SUMMARY_PREFIX = "以下是用户历史消息的摘要，请仅作为参考，用户没有提起则不要回答摘要中的内容：\\n";


    public ChatMessageHandler(ConversationDomainService conversationDomainService, ContextDomainService contextDomainService) {
        super(conversationDomainService, contextDomainService);
    }

    @Override
    public <T> T handleChat(ChatContext environment, MessageTransport<T> transport) {
        // 创建用户消息
        MessageEntity userMessage = MessageFactory.createUserMessage(environment);
        // 创建Assist消息
        MessageEntity assistMessage = MessageFactory.createAssistMessage(environment);
        // 创建连接
        T connection = transport.createConnection(CONNECTION_TIMEOUT);
        // 创建langchain4j消息请求
        ChatRequest chatRequest = prepareChatRequest(environment);

        // 获取聊天客户端
        StreamingChatModel chatModel = LlmProviderService.getStreamModel(environment.getProviderEntity().getProtocol(), environment.getProviderEntity().getConfig());

        // 处理聊天请求
        processChat(chatRequest,
                environment,
                chatModel,
                connection,
                transport,
                userMessage,
                assistMessage);

        return connection;
    }


    private ChatRequest prepareChatRequest(ChatContext environment) {

        List<ChatMessage> chatMessages = new ArrayList<>();

        // 1.获取提示词提示词
        if (StringUtils.isNotBlank(environment.getAgentEntity().getSystemPrompt())) {
            chatMessages.add(new SystemMessage(environment.getAgentEntity().getSystemPrompt()));
        }

        // 2.获取摘要信息（需要有摘要前缀提示）
        if (StringUtils.isNotBlank(environment.getContextEntity().getSummary())) {
            chatMessages.add(new AiMessage(SUMMARY_PREFIX + environment.getContextEntity().getSummary()));
        }

        // 3.获取历史消息
        for (MessageEntity message : environment.getHistoryMessages()) {
            // 用户消息
            if (message.getRole() == Role.USER) {
                chatMessages.add(new UserMessage(message.getContent()));
            } else if (message.getRole() == Role.ASSISTANT) {
                chatMessages.add(new AiMessage(message.getContent()));
            }
        }

        // 添加当前用户消息
        chatMessages.add(new UserMessage(environment.getUserMessage()));

        // 设置请求参数
        ChatRequestParameters requestParameter = LlmRequestParameterFactory.getRequestParameter(environment.getProviderEntity().getProtocol(), environment.getLlmModelConfig());

        return ChatRequest.builder()
                .messages(chatMessages)
                .parameters(requestParameter)
                .build();
    }


    /**
     * 处理聊天请求
     *
     * @param chatRequest   聊天请求
     * @param chatContext   聊天环境
     * @param chatModel     模型客户端
     * @param connection    连接对象
     * @param transport     传输对象
     * @param userMessage   用户信息
     * @param assistMessage llm信息
     */
    private <T> void processChat(ChatRequest chatRequest,
                                 ChatContext chatContext,
                                 StreamingChatModel chatModel,
                                 T connection,
                                 MessageTransport<T> transport,
                                 MessageEntity userMessage,
                                 MessageEntity assistMessage) {

        chatModel.chat(chatRequest, new StreamingChatResponseHandler() {
            @Override
            public void onPartialResponse(String partialResponse) {
                AgentChatResponse response = AgentChatResponse.build(partialResponse, false, false, MessageType.TEXT);
                transport.sendMessage(connection, response);
            }

            @Override
            public void onCompleteResponse(ChatResponse completeResponse) {
                TokenUsage tokenUsage = completeResponse.tokenUsage();
                Integer inputTokenCount = tokenUsage.inputTokenCount();
                // 设置用户token使用量
                userMessage.setTokenCount(inputTokenCount);

                // 设置Llm回复消息和token使用量
                Integer outputTokenCount = tokenUsage.outputTokenCount();
                String aiMessage = completeResponse.aiMessage().text();
                assistMessage.setContent(aiMessage);
                assistMessage.setTokenCount(outputTokenCount);

                AgentChatResponse response = AgentChatResponse.build("", true, false, MessageType.TEXT);
                // 发送完成消息
                transport.sendEndMessage(connection, response);
                saveMessages(chatContext, userMessage, assistMessage);
            }

            @Override
            public void onError(Throwable error) {
                transport.handleError(connection, error);
            }

            @Override
            public void onPartialThinking(PartialThinking partialThinking) {
                AgentChatResponse response = AgentChatResponse.build(partialThinking.text(), false, true, MessageType.TEXT);
                transport.sendMessage(connection, response);
            }
        });
    }
}
