package com.xiaoguai.agentx.application.conversation.service.message.chat;


import com.xiaoguai.agentx.application.conversation.service.AbstractMessageHandler;
import com.xiaoguai.agentx.application.conversation.service.message.agent.ToolCallManager;
import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.domain.conversation.service.MessageDomainService;
import org.springframework.stereotype.Component;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 10:31
 * @Description: 聊天类型消息处理
 */
@Component
public class ChatMessageHandler extends AbstractMessageHandler {


    protected ChatMessageHandler(MessageDomainService messageDomainService, ConversationDomainService conversationDomainService) {
        super(messageDomainService, conversationDomainService);
    }
}
