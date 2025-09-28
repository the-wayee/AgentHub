package com.xiaoguai.agentx.application.conversation.service.message.agent;


import com.xiaoguai.agentx.application.conversation.service.AbstractMessageHandler;
import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import org.springframework.stereotype.Component;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 14:48
 * @Description: Agent消息处理器
 */
@Component
public class AgentMessageHandler extends AbstractMessageHandler {

    protected AgentMessageHandler(ConversationDomainService conversationDomainService, ContextDomainService contextDomainService) {
        super(conversationDomainService, contextDomainService);
    }


}
