package com.xiaoguai.agentx.application.conversation.dto;


import jakarta.validation.constraints.NotBlank;

/**
 * @Author: the-way
 * @Verson: v1.0
 */
public class StreamChatRequest {

    /**
     * 消息
     */
    @NotBlank(message = "消息不能为空")
    private String message;


    /**
     * 会话id
     */
    @NotBlank(message = "会话Id不能为空")
    private String sessionId;

    /**
     * 是否启用推理
     */
    private Boolean enableThink = false;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Boolean getEnableThink() {
        return enableThink;
    }

    public void setEnableThink(Boolean enableThink) {
        this.enableThink = enableThink;
    }
}
