package com.xiaoguai.agentx.application.conversation.dto;


import com.xiaoguai.agentx.application.task.dto.TaskDTO;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;

import java.util.List;

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
     * 是否思考
     */
    private boolean isThinking;

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

    /**
     * 子任务列表
     */
    private List<TaskDTO> tasks;


    private Long timestamp = System.currentTimeMillis();


    private static AgentChatResponse build(String content, boolean isThinking, MessageType messageType) {
        AgentChatResponse streamChatResponse = new AgentChatResponse();
        streamChatResponse.setContent(content);
        streamChatResponse.setDone(false);
        streamChatResponse.setThinking(isThinking);
        streamChatResponse.setMessageType(messageType);
        return streamChatResponse;
    }

    public static AgentChatResponse buildMessage(String content, MessageType messageType) {
        return build(content, false, messageType);
    }

    public static AgentChatResponse buildThinkResponse(String content, MessageType messageType) {
        return build(content, true, messageType);
    }

    public static AgentChatResponse buildEndMessage(MessageType messageType) {
        AgentChatResponse streamChatResponse = new AgentChatResponse();
        streamChatResponse.setContent("");
        streamChatResponse.setDone(true);
        streamChatResponse.setThinking(false);
        streamChatResponse.setMessageType(messageType);
        return streamChatResponse;
    }


    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public boolean isThinking() {
        return isThinking;
    }

    public void setThinking(boolean thinking) {
        isThinking = thinking;
    }

    public MessageType getMessageType() {
        return messageType;
    }

    public void setMessageType(MessageType messageType) {
        this.messageType = messageType;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getPayLoad() {
        return payLoad;
    }

    public void setPayLoad(String payLoad) {
        this.payLoad = payLoad;
    }

    public List<TaskDTO> getTasks() {
        return tasks;
    }

    public void setTasks(List<TaskDTO> tasks) {
        this.tasks = tasks;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
}
