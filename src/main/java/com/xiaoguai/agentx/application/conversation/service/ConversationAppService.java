package com.xiaoguai.agentx.application.conversation.service;


import com.xiaoguai.agentx.domain.conversation.model.MessageDTO;
import com.xiaoguai.agentx.domain.conversation.service.ConversationService;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-26 16:58
 * @Description: 对话应用服务，用于适配域层的对话服务
 */
@Service
public class ConversationAppService {

    private final ConversationService conversationService;

    public ConversationAppService(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    /**
     * 流式回复
     */
    public SseEmitter chatStream(String sessionId, String content) {
        return conversationService.chat(sessionId, content);
    }

    /**
     * 发送消息并获取同步回复（非流式）
     */
    public MessageDTO chatSync(String sessionId, String content) {
        return conversationService.chatSync(sessionId, content);
    }

    /**
     * 创建新会话并发送第一条消息
     */
    public SseEmitter createSessionAndChat(String title, String userId, String content) {
        return conversationService.createSessionAndChat(title, userId, content);
    }

    /**
     * 清空上下文
     */
    public void clearContext(String sessionId) {
        conversationService.clearContext(sessionId);
    }
}
