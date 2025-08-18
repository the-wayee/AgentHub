package com.xiaoguai.agentx.infrastrcture.transport;


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
     * @param content 消息内容
     * @param isDone 是否完成
     * @param isReasoning 是否推理
     * @param provider 服务商
     * @param model 模型
     */
    void sendMessage(T connection, String content,
                     boolean isDone,
                     boolean isReasoning,
                     String provider,
                     String model);

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
    void handlerError(T connection, Throwable ex);
}
