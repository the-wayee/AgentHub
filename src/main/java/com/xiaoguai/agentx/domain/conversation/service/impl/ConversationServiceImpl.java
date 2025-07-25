package com.xiaoguai.agentx.domain.conversation.service.impl;


import com.xiaoguai.agentx.domain.conversation.model.MessageDTO;
import com.xiaoguai.agentx.domain.conversation.service.ContextService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationService;
import com.xiaoguai.agentx.domain.conversation.service.MessageService;
import com.xiaoguai.agentx.domain.conversation.service.SessionService;
import com.xiaoguai.agentx.domain.llm.model.LlmMessage;
import com.xiaoguai.agentx.domain.llm.model.LlmRequest;
import com.xiaoguai.agentx.domain.llm.service.LlmService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.concurrent.ExecutorService;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-25 11:43
 * @Description: 对话服务
 */
@Service
public class ConversationServiceImpl implements ConversationService {

    private static final Logger logger = LoggerFactory.getLogger(ConversationServiceImpl.class);

    private final MessageService messageService;
    private final SessionService sessionService;
    private final ContextService contextService;
    private final ExecutorService contextExecutorService;
    private final LlmService llmService;

    public ConversationServiceImpl(MessageService messageService,
                                   SessionService sessionService,
                                   ContextService contextService,
                                   ExecutorService contextExecutorService,
                                   LlmService llmService) {
        this.messageService = messageService;
        this.sessionService = sessionService;
        this.contextService = contextService;
        this.contextExecutorService = contextExecutorService;
        this.llmService = llmService;
    }

    @Override
    public SseEmitter chat(String sessionId, String content) {
        // 1.设置sse发射器
        SseEmitter sseEmitter = new SseEmitter();

        // 2. 保存用户消息
        messageService.sendUserMessage(sessionId, content);

        // 3.异步提交任务，上下文调用LLM服务
        contextExecutorService.execute(() -> {
            // 1.获取上下文消息
            List<MessageDTO> contextMessages = contextService.getContextMessages(sessionId);
            // 2. 转换成LLM消息
            List<LlmMessage> llmMessages = convertToLlmMessage(contextMessages);
            LlmRequest llmRequest = new LlmRequest();
            llmRequest.setStream(true);
            llmRequest.setMessages(llmMessages);

            // 3.调用llm聊天服务
            llmService.chatStream(llmRequest, ((chunk, isLast) -> {
                try {
                    sseEmitter.send(chunk);
                    if (isLast) {
                        sseEmitter.complete();
                    }
                } catch (Exception e) {
                    logger.error("<流式响应前端报错>: {}", e.getMessage());
                    sseEmitter.completeWithError(e);
                }
            }));
        });

        // 4. 返回sse发射器
        return sseEmitter;

    }

    @Override
    public MessageDTO chatSync(String sessionId, String content) {
        return null;
    }

    @Override
    public SseEmitter createSessionAndChat(String title, String userId, String content) {
        return null;
    }

    @Override
    public void clearContext(String sessionId) {

    }


    /**
     * 转换Llm消息
     */
    private List<LlmMessage> convertToLlmMessage(List<MessageDTO> messageDTOS) {
        return messageDTOS.stream()
                .map(e -> new LlmMessage(e.getRole(), e.getContent()))
                .toList();
    }
}
