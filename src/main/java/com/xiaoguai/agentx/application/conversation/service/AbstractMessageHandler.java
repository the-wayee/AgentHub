package com.xiaoguai.agentx.application.conversation.service;


import com.xiaoguai.agentx.domain.conversation.constants.Role;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;

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
    public abstract <T> T handleChat(ChatContext environment, MessageTransport<T> transport);


    /**
     * 创建用户消息
     */
    protected MessageEntity createUserMessage(ChatContext chatContext) {
        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setSessionId(chatContext.getSessionId());
        messageEntity.setContent(chatContext.getUserMessage());
        messageEntity.setRole(Role.USER);
        return messageEntity;
    }

    /**
     * 创建助理消息
     */
    protected MessageEntity createAssistMessage(ChatContext chatContext) {
        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setSessionId(chatContext.getSessionId());
        messageEntity.setProvider(chatContext.getProviderEntity().getId());
        messageEntity.setModel(chatContext.getModelEntity().getId());
        messageEntity.setRole(Role.ASSISTANT);
        return messageEntity;
    }


    /**
     * 保存消息
     */
    protected void saveMessages(ChatContext chatContext, MessageEntity userMessage, MessageEntity assistMessage) {
        // 保存消息
        conversationDomainService.saveMessagesToContext(List.of(userMessage, assistMessage), chatContext.getContextEntity());
    }
}
