package com.xiaoguai.agentx.application.conversation.service.agent.workflow;


import com.xiaoguai.agentx.application.conversation.dto.AgentChatResponse;
import com.xiaoguai.agentx.application.conversation.service.ChatContext;
import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEvent;
import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEventBus;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.task.model.TaskEntity;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;

import java.awt.*;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-14 15:20
 * @Description: 工作流上下文
 */
public class AgentWorkflowContext<T> {

    /**
     * 工作流上下文唯一id
     */
    private final String id = UUID.randomUUID().toString();

    /**
     * 对话上下文
     */
    private ChatContext chatContext;

    /**
     * 传输通道
     */
    private MessageTransport<T> transport;

    /**
     * 连接对象
     */
    private T connection;

    /**
     * 上一个工作流状态
     */
    private volatile AgentWorkflowStatus previousStatus;

    /**
     * 工作流状态
     */
    private volatile AgentWorkflowStatus status = AgentWorkflowStatus.INITIALIZED;

    /**
     * 用户消息
     */
    private MessageEntity userMessage;

    /**
     * 大模型消息
     */
    private MessageEntity assistMessage;

    /**
     * 父任务
     * 代表这个会话的复杂任务
     */
    private TaskEntity parentTask;

    /**
     * 子任务
     * k -> 任务名称
     * v -> 任务实体
     */
    private Map<String, TaskEntity> subTasks;

    /**
     * 子任务结果映射
     * k -> 任务名称
     * v -> 任务结果
     */
    private Map<String, String> subTasksResult = new LinkedHashMap<>();

    /**
     * 额外信息，用来分析任务是否需要拆分
     */
    private Map<String, Object> extraData = new HashMap<>();


    /**
     * 发送结束消息
     */
    public void sendEndMessage(String message, MessageType messageType) {
        AgentChatResponse response = AgentChatResponse.build(message, true, false, messageType);
        transport.sendEndMessage(connection, response);
    }

    /**
     * 发送异常消息
     */
    public void sendErrorMessage(Throwable ex) {
        String message = "执行过程产生错误: " + ex.getMessage();
        sendEndMessage(message, MessageType.TEXT);
    }

    public void transitionTo(AgentWorkflowStatus status) {
        this.previousStatus = this.status;
        this.status = status;
        AgentEvent<T> event = new AgentEvent<>(this, this.previousStatus, this.status);
        AgentEventBus.publishEvent(event);
    }

    public String getId() {
        return id;
    }

    public ChatContext getChatContext() {
        return chatContext;
    }

    public void setChatContext(ChatContext chatContext) {
        this.chatContext = chatContext;
    }

    public MessageTransport<T> getTransport() {
        return transport;
    }

    public void setTransport(MessageTransport<T> transport) {
        this.transport = transport;
    }

    public T getConnection() {
        return connection;
    }

    public void setConnection(T connection) {
        this.connection = connection;
    }

    public AgentWorkflowStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(AgentWorkflowStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public AgentWorkflowStatus getStatus() {
        return status;
    }

    public void setStatus(AgentWorkflowStatus status) {
        this.status = status;
    }

    public MessageEntity getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(MessageEntity userMessage) {
        this.userMessage = userMessage;
    }

    public MessageEntity getAssistMessage() {
        return assistMessage;
    }

    public void setAssistMessage(MessageEntity assistMessage) {
        this.assistMessage = assistMessage;
    }

    public TaskEntity getParentTask() {
        return parentTask;
    }

    public void setParentTask(TaskEntity parentTask) {
        this.parentTask = parentTask;
    }

    public Map<String, TaskEntity> getSubTasks() {
        return subTasks;
    }

    public void setSubTasks(Map<String, TaskEntity> subTasks) {
        this.subTasks = subTasks;
    }

    public Map<String, String> getSubTasksResult() {
        return subTasksResult;
    }

    public void setSubTasksResult(Map<String, String> subTasksResult) {
        this.subTasksResult = subTasksResult;
    }

    public Map<String, Object> getExtraData() {
        return extraData;
    }

    public void addExtraData(String key,  Object value) {
        this.extraData.put(key, value);
    }
}
