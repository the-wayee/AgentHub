package com.xiaoguai.agentx.domain.conversation.service;


import com.xiaoguai.agentx.domain.conversation.model.MessageDTO;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-24 20:59
 * @Description: 上下文服务
 */
public interface ContextService {

    /**
     * 获取上下文（活跃消息）
     */
    List<MessageDTO> getContextMessages(String sessionId);

    /**
     * 添加消息到上下文
     */
    void addMessageToContext(String messageId, String sessionId);

    /**
     * 更新上下文（滑动窗口）
     */
    void updateContext(String sessionId);

    /**
     *清空上下文
     */
    void clearContext(String sessionId);

    /**
     * 初始化上下文
     */
    void initializeContext(String sessionId);

    /**
     * 删除上下文
     */
    void deleteContext(String sessionId);
}
