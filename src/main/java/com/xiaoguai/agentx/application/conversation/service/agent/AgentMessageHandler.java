package com.xiaoguai.agentx.application.conversation.service.agent;


import com.xiaoguai.agentx.application.conversation.service.ChatContext;
import com.xiaoguai.agentx.application.conversation.service.chat.ChatMessageHandler;
import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;
import org.springframework.stereotype.Component;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 14:48
 * @Description: Agent消息处理器
 */
@Component
public class AgentMessageHandler extends ChatMessageHandler {

    public AgentMessageHandler(ConversationDomainService conversationDomainService, ContextDomainService contextDomainService) {
        super(conversationDomainService, contextDomainService);
    }

    @Override
    public <T> T handleChat(ChatContext environment, MessageTransport<T> transport) {
        return super.handleChat(environment, transport);
    }
}
