package com.xiaoguai.agentx.application.conversation.dto;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-23 19:34
 * @Description: StreamChatRequest
 */
public class StreamChatRequest extends ChatRequest {

    private boolean stream = true;

    public boolean isStream() {
        return stream;
    }

    public void setStream(boolean stream) {
        this.stream = stream;
    }
}
