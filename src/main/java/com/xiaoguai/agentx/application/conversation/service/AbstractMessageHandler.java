package com.xiaoguai.agentx.application.conversation.service;


import com.xiaoguai.agentx.application.conversation.service.context.ChatContext;
import com.xiaoguai.agentx.domain.conversation.constants.Role;
import com.xiaoguai.agentx.domain.conversation.factory.MessageFactory;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.infrastrcture.llm.LlmProviderService;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;
import dev.langchain4j.model.chat.StreamingChatModel;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-14 14:58
 * @Description: 模板消息处理
 */
public abstract class AbstractMessageHandler implements MessageHandler {

    /**
     * 默认连接超时时间：5min
     */
    protected static final long CONNECTION_TIMEOUT = 300000L;

    /**
     * 摘要前缀信息
     */
    private static final String SUMMARY_PREFIX = "以下是用户历史消息的摘要，请仅作为参考，用户没有提起则不要回答摘要中的内容：\\n";


    private final ConversationDomainService conversationDomainService;
    private final ContextDomainService contextDomainService;

    protected AbstractMessageHandler(ConversationDomainService conversationDomainService, ContextDomainService contextDomainService) {
        this.conversationDomainService = conversationDomainService;
        this.contextDomainService = contextDomainService;
    }


    /**
     *交给子类实现
     * @param environment 对话环境
     * @param transport   传输对象
     */
    @Override
    public <T> T handleChat(ChatContext environment, MessageTransport<T> transport) {
        // 创建连接
        T connection = transport.createConnection(CONNECTION_TIMEOUT);

        // 创建model
        StreamingChatModel streamModel = LlmProviderService.getStreamModel(environment.getProviderEntity().getProtocol() , environment.getProviderEntity().getConfig());

        // 创建对话消息
        MessageEntity userMessage = createUserMessage(environment);
        MessageEntity assistMessage = createAssistMessage(environment);

        //

        return connection;
    }


    /**
     * 创建用户消息
     */
    protected MessageEntity createUserMessage(ChatContext chatContext) {
        return MessageFactory.createUserMessage(chatContext);
    }

    /**
     * 创建助理消息
     */
    protected MessageEntity createAssistMessage(ChatContext chatContext) {
        return MessageFactory.createAssistMessage(chatContext);
    }

}
