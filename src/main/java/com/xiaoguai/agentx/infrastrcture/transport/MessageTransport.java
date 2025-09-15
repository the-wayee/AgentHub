package com.xiaoguai.agentx.infrastrcture.transport;


import com.xiaoguai.agentx.application.conversation.dto.AgentChatResponse;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 09:54
 * @Description: 消息传输接口，用来抽象各种传输类型（SSE， WEBSOCKET）
 */
public interface MessageTransport<T>{

    /**
     * 创建连接
     * @param timeout 超时时间
     */
    T createConnection(long timeout);

    /**
     * 发送消息
     * @param connection 连接对象
     * @param response 响应内容
     */
    void sendMessage(T connection, AgentChatResponse response);

    void sendEndMessage(T connection, AgentChatResponse response);

    /**
     * 连接完成
     * @param connection 连接对象
     */
    void completeConnection(T connection);

    /**
     * 处理异常
     * @param connection 连接对象
     * @param ex 异常
     */
    void handleError(T connection, Throwable ex);
}
