package com.xiaoguai.agentx.domain.conversation.factory;


import com.xiaoguai.agentx.domain.conversation.constants.Role;
import com.xiaoguai.agentx.application.conversation.service.ChatContext;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 10:41
 * @Description: 消息工厂，用来创建各种类型消息
 */
public class MessageFactory {

    /**
     * 创建用户消息
     * @param environment 对话环境
     */
    public static MessageEntity createUserMessage(ChatContext environment) {
        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setSessionId(environment.getSessionId());
        messageEntity.setContent(environment.getUserMessage());
        messageEntity.setRole(Role.USER);
        return messageEntity;
    }

    /**
     * 创建助理消息
     * @param environment 对话环境
     */
    public static MessageEntity createAssistMessage(ChatContext environment) {
        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setSessionId(environment.getSessionId());
        messageEntity.setProvider(environment.getProviderEntity().getId());
        messageEntity.setModel(environment.getModelEntity().getId());
        messageEntity.setRole(Role.ASSISTANT);
        return messageEntity;
    }
}
