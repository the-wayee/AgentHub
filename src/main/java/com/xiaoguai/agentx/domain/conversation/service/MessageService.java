package com.xiaoguai.agentx.domain.conversation.service;


import com.xiaoguai.agentx.domain.conversation.model.MessageDTO;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-24 20:59
 * @Description: 消息管理服务
 */
public interface MessageService {

    /**
     * 保存用户消息
     */
    MessageDTO sendUserMessage(String sessionId, String content);

    /**
     * 保存助手响应消息
     */
    MessageDTO saveAssistantMessage(String sessionId, String content,
                                    String model, String provider, Integer tokenCount);
    /**
     * 保存系统消息
     */
    MessageDTO saveSystemMessage(String sessionId, String content);

    /**
     * 获取会话所有消息
     */
    List<MessageDTO> getSessionMessages(String sessionId);

    /**
     * 获取会话最近N条消息
     */
    List<MessageDTO> getRecentMessages(String sessionId, int count);

    /**
     * 删除消息
     */
    void deleteMessage(String messageId);

    /**
     * 删除会话所有消息
     */
    void deleteSessionMessages(String sessionId);
}
