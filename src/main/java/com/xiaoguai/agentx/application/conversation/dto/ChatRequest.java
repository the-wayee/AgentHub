package com.xiaoguai.agentx.application.conversation.dto;


import jakarta.validation.constraints.NotBlank;

/**
 * @Author: the-way
 * @Verson: v1.0
 */
public class ChatRequest {

    /**
     * 消息
     */
    @NotBlank(message = "消息不能为空")
    private String message;

    /**
     * 供应商
     */
    private String provider;

    /**
     * 会话id
     */
    private String sessionId;

    /**
     * 模型
     */
    private String model;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

}
