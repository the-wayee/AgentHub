package com.xiaoguai.agentx.application.conversation.service.agent.workflow;


import com.xiaoguai.agentx.application.conversation.dto.AgentChatResponse;
import com.xiaoguai.agentx.application.conversation.service.ChatContext;
import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEvent;
import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEventBus;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.task.model.TaskEntity;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;

import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

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
     */
    private TaskEntity parentTask;


    private List<String> tasks = new ArrayList<>();


    /**
     * 当前执行任务索引
     */
    private final AtomicInteger currentTaskIndex = new AtomicInteger(0);
    /**
     * 子任务
     * k -> 任务名称
     * v -> 任务实体
     */
    private Map<String, TaskEntity> subTasks = new LinkedHashMap<>();

    /**
     * 子任务结果映射
     * k -> 任务名称
     * v -> 任务结果
     */
    private final Map<String, String> subTasksResult = new LinkedHashMap<>();

    /**
     * 已完成的任务数量
     */
    private int completeTaskCount = 0;

    /**
     * 额外信息，用来分析任务是否需要拆分
     */
    private final Map<String, Object> extraData = new HashMap<>();

    /**
     * 工作流是否中断
     */
    private boolean isBreak = false;

    /**
     * 发送普通消息
     */
    public void sendMessage(String message, MessageType messageType){
        AgentChatResponse response = AgentChatResponse.build(message, false, false, messageType);
        transport.sendMessage(connection, response);
    }
    /**
     * 发送结束消息
     */
    public void sendEndMessage(String message, MessageType messageType) {
        AgentChatResponse response = AgentChatResponse.build(message, true, false, messageType);
        transport.sendMessage(connection, response);
    }

    public void sendEndMessage(MessageType messageType) {
        AgentChatResponse response = AgentChatResponse.buildEndMessage(messageType);
        transport.sendMessage(connection, response);
    }

    /**
     * 发送异常消息
     */
    public void sendErrorMessage(Throwable ex) {
        String message = "执行过程产生错误: " + ex.getMessage();
        sendEndMessage(message, MessageType.TEXT);
    }

    /**
     * 流式发送消息（模拟流式效果）
     */
    public void sendStreamMessage(String message, MessageType messageType) {
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

        // 将消息按句子拆分，如果消息较短则按词拆分
        List<String> chunks = splitMessageIntoChunks(message);

        for (int i = 0; i < chunks.size(); i++) {
            final int index = i;
            final String chunk = chunks.get(i);
            final boolean isLast = (index == chunks.size() - 1);

            scheduler.schedule(() -> {
                try {
                    AgentChatResponse response = AgentChatResponse.build(chunk, isLast, false, messageType);
                    if (isLast) {
                        transport.sendEndMessage(connection, response);
                    } else {
                        transport.sendMessage(connection, response);
                    }
                } catch (Exception e) {
                    // 忽略发送异常，避免影响主流程
                }
            }, index * 30, TimeUnit.MILLISECONDS); // 每30ms发送一个片段
        }

        // 关闭调度器
        scheduler.schedule(scheduler::shutdown, (chunks.size() + 1) * 30, TimeUnit.MILLISECONDS);
    }

    /**
     * 将消息拆分为单个字符
     */
    private List<String> splitMessageIntoChunks(String message) {
        List<String> chunks = new ArrayList<>();

        // 逐字拆分
        for (int i = 0; i < message.length(); i++) {
            chunks.add(String.valueOf(message.charAt(i)));
        }

        return chunks.isEmpty() ? Collections.singletonList(message) : chunks;
    }

    public void transitionTo(AgentWorkflowStatus status) {
        this.previousStatus = this.status;
        this.status = status;
        AgentEvent<T> event = new AgentEvent<>(this, this.previousStatus, this.status);
        AgentEventBus.publishEvent(event);
    }

    /**
     * 添加子任务
     */
    public void addSubTask(TaskEntity task) {
        tasks.add(task.getTaskName());
        subTasks.put(task.getTaskName(), task);
    }

    /**
     * 判断是否还有下一个任务
     */
    public boolean hasNextTask() {
        return currentTaskIndex.get() < tasks.size();
    }

    /**
     * 设置任务结果
     */
    public void setTaskResult(String taskName,  String taskResult) {
        subTasksResult.put(taskName, taskResult);
        completeTaskCount++;
    }
    /**
     * 获取当前执行任务
     */
    public String getCurrentTask() {
        int index = currentTaskIndex.getAndIncrement();
        if (index < tasks.size()) {
            return tasks.get(index);
        }
        return null;
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

    public List<String> getTasks() {
        return tasks;
    }

    public void setTasks(List<String> tasks) {
        this.tasks = tasks;
    }

    public Map<String, Object> getExtraData() {
        return extraData;
    }

    public void addExtraData(String key,  Object value) {
        this.extraData.put(key, value);
    }

    public AtomicInteger getCurrentTaskIndex() {
        return currentTaskIndex;
    }

    public int getCompleteTaskCount() {
        return completeTaskCount;
    }

    public int getTotalTaskCount() {
        return tasks.size();
    }

    public void setCompleteTaskCount(int completeTaskCount) {
        this.completeTaskCount = completeTaskCount;
    }

    public boolean isBreak() {
        return isBreak;
    }

    public void setBreak(boolean aBreak) {
        isBreak = aBreak;
    }

    public void sendTaskEndMessage(String taskId, MessageType messageType) {
        AgentChatResponse response = AgentChatResponse.buildEndMessage(messageType);
        response.setTaskId(taskId);
        transport.sendMessage(connection, response);
    }

    /**
     * 发送任务开始消息（包含任务内容和taskId）
     */
    public void sendTaskStartMessage(String taskContent, String taskId, MessageType messageType) {
        AgentChatResponse response = AgentChatResponse.build(taskContent, true, false, messageType);
        response.setTaskId(taskId);
        transport.sendMessage(connection, response);
    }
}
