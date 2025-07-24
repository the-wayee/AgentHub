package com.xiaoguai.agentx.interfaces.api.conversation;


import com.xiaoguai.agentx.application.conversation.dto.ChatRequest;
import com.xiaoguai.agentx.application.conversation.dto.ChatResponse;
import com.xiaoguai.agentx.application.conversation.dto.StreamChatRequest;
import com.xiaoguai.agentx.application.conversation.service.ConversationService;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import jakarta.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 会话聊天
 */
@CrossOrigin("*")
@RestController
@RequestMapping("/conversation")
public class ChatController {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final ExecutorService executorService = Executors.newCachedThreadPool();

    @Resource
    private ConversationService conversationService;

    /**
     * 普通聊天
     */
    @PostMapping(value = "/chat")
    public Result<ChatResponse> chat(@RequestBody ChatRequest request) {
        logger.info("收到聊天请求: {}, 服务商: {}, 模型: {}",
                request.getMessage(),
                request.getProvider() != null ? request.getProvider() : "默认",
                request.getModel() != null ? request.getModel() : "默认");

        try {
            ChatResponse response = conversationService.chat(request);
            logger.info("===>返回响应内容:{}", response.getContent());
            return Result.success(response);
        } catch (Exception e) {
            logger.error("===>处理聊天请求异常", e);
            return Result.serverError("===>处理请求失败: " + e.getMessage());
        }
    }

    /**
     * 流式输出
     */
    @GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream(@RequestBody @Validated StreamChatRequest request) {

        SseEmitter sseEmitter = new SseEmitter(0L);

        executorService.execute(() -> {
            try {
                for (int i = 0; i < 100; i++) {
                    sseEmitter.send("正在发送第" + i + "条消息");
                    Thread.sleep(100);
                }
                sseEmitter.complete();
            } catch (Exception e) {
                sseEmitter.completeWithError(e);
            }
        });
        return sseEmitter;
    }
}
