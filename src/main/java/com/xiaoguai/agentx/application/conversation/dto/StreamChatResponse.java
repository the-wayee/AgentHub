package com.xiaoguai.agentx.application.conversation.dto;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-24 13:47
 * @Description: 聊天服务响应
 */

public class StreamChatResponse {

    /**
     * 响应内容
     */
    private String content;

    /**
     * 会话ID
     */
    private String sessionId;

    /**
     * 使用的服务商
     */
    private String provider;

    /**
     * 使用的模型
     */
    private String model;

    /**
     * 是否推理
     */
    private boolean isReasoning;
    /**
     * 是否完成
     */
    private boolean isDone;

    /**
     * 时间戳
     */
    private Long timestamp = System.currentTimeMillis();

    public StreamChatResponse() {
    }


    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public boolean isDone() {
        return isDone;
    }

    public void setDone(boolean done) {
        isDone = done;
    }


    public boolean isReasoning() {
        return isReasoning;
    }

    public void setReasoning(boolean reasoning) {
        isReasoning = reasoning;
    }
}
