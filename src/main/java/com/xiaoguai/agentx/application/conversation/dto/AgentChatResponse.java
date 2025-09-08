package com.xiaoguai.agentx.application.conversation.dto;


import com.xiaoguai.agentx.domain.conversation.constants.MessageType;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-08 11:29
 * @Description: Agent流式响应
 */
public class AgentChatResponse {

    /**
     * 消息类容
     */
    private String content;

    /**
     * 是否完成
     */
    private boolean done;

    /**
     * 消息类型
     */
    private MessageType messageType = MessageType.TEXT;

    /**
     * 关联的任务id
     */
    private String taskId;

    /**
     * 数据载荷，非文本内容
     */
    private String payLoad;

    private

    private Long timestamp = System.currentTimeMillis();

}
