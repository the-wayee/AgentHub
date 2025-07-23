package com.xiaoguai.agentx.interfaces.api.conversation;


import com.xiaoguai.agentx.application.conversation.dto.StreamChatRequest;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-23 19:24
 * @Description: ChatController
 */
@CrossOrigin("*")
@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ExecutorService executorService = Executors.newCachedThreadPool();

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream() {
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
