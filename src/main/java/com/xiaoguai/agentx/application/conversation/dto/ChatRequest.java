package com.xiaoguai.agentx.application.conversation.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * @Author: the-way
 * @Verson: v1.0
 */
@Data
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
    private Long sessionId;

    /**
     * 模型
     */
    private String model;
}
