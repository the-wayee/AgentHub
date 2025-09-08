package com.xiaoguai.agentx.infrastrcture.transport;


import com.xiaoguai.agentx.application.conversation.dto.AgentChatResponse;
import com.xiaoguai.agentx.application.conversation.dto.StreamChatResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 10:02
 * @Description: Sse消息传输
 */
public class SseMessageTransport implements MessageTransport<SseEmitter>{

    private static final Logger logger = LoggerFactory.getLogger(SseMessageTransport.class);

    private static final String TIMEOUT_MESSAGE = "\n\n [系统提示：响应超时，请重试!]";

    private static final String SYSTEM_ERROR_MESSAGE = "\n\n [系统错误: ";

    @Override
    public SseEmitter createConnection(long timeout) {
        SseEmitter emitter = new SseEmitter(timeout);

        // 设置超时回调
        emitter.onTimeout(() -> {
            try {
                StreamChatResponse response = new StreamChatResponse();
                response.setDone(true);
                response.setContent(TIMEOUT_MESSAGE);
                emitter.send(response);
            } catch (IOException e) {
                logger.error("系统超时响应失败: {}", e.getMessage());
            }
        });

        // 设置错误回调
        emitter.onError((ex) -> {
            try {
                StreamChatResponse response = new StreamChatResponse();
                response.setDone(true);
                response.setContent(SYSTEM_ERROR_MESSAGE + ex.getMessage() + "]");
                emitter.send(response);
            } catch (IOException e) {
                logger.error("系统错误响应失败: {}", e.getMessage());
            }
        });

        return emitter;
    }

    @Override
    public void sendMessage(SseEmitter connection, AgentChatResponse response) {
        try {
            connection.send(response);
        } catch (IOException e) {
            logger.error("消息发送失败: {}", e.getMessage());
        }
    }

    @Override
    public void completeConnection(SseEmitter connection) {
        connection.complete();
    }

    @Override
    public void handleError(SseEmitter connection, Throwable ex) {
        try {
            AgentChatResponse response = new AgentChatResponse();
            response.setContent(ex.getMessage());
            response.setDone(true);
            response.setThinking(false);
            connection.send(response);
            connection.complete();
        } catch (IOException e) {
            logger.error("错误响应失败: {}", e.getMessage());
        }
    }
}
