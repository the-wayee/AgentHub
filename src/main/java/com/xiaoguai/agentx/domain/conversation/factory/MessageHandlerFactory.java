package com.xiaoguai.agentx.domain.conversation.factory;


import com.xiaoguai.agentx.application.conversation.service.MessageHandler;
import com.xiaoguai.agentx.application.conversation.service.message.agent.AgentMessageHandler;
import com.xiaoguai.agentx.application.conversation.service.message.chat.ChatMessageHandler;
import com.xiaoguai.agentx.domain.agent.constant.AgentType;
import com.xiaoguai.agentx.domain.agent.model.AgentEntity;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 10:44
 * @Description: 消息处理器工厂，获取{CHAT, AGENT}类型的处理器
 */
@Component
public class MessageHandlerFactory {

    private final ApplicationContext applicationContext;

    public MessageHandlerFactory(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    /**
     * 获取消息处理器
     * @param agent 智能体实体
     * @return 消息处理器
     */
    public MessageHandler getMessageHandler(AgentEntity agent) {
        AgentType agentType = agent.getAgentType();
        return getMessageHandlerByType(agentType);
    }

    private MessageHandler getMessageHandlerByType(AgentType type) {
        MessageHandler handler;
        switch (type) {
            case CHAT_ASSISTANT -> {
                handler = applicationContext.getBean("chatMessageHandler", ChatMessageHandler.class);
            }
            case FUNCTIONAL_AGENT -> {
                handler = applicationContext.getBean("agentMessageHandler", AgentMessageHandler.class);
            }
            default -> handler = applicationContext.getBean("chatMessageHandler", ChatMessageHandler.class);
        }
        return handler;
    }
}
