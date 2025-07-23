package com.xiaoguai.agentx.application.conversation.dto;


import lombok.Data;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-23 19:34
 * @Description: StreamChatRequest
 */
@Data
public class StreamChatRequest extends ChatRequest{

    private boolean stream = true;
}
