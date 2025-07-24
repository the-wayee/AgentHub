package com.xiaoguai.agentx.application.conversation.dto;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-24 13:47
 * @Description: 聊天服务响应
 */
public class StreamChatResponse extends StreamChatRequest {

    /**
     * 是否完成
     */
    private boolean isDone;

    public boolean isDone() {
        return isDone;
    }

    public void setDone(boolean done) {
        isDone = done;
    }
}
