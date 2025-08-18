package com.xiaoguai.agentx.domain.conversation.handler;


import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 10:28
 * @Description: 消息处理器
 */
public interface MessageHandler {


    /**
     * 处理聊天
     *
     * @param environment 对话环境
     * @param transport   传输对象
     * @return 连接类型
     */
    <T> T handleChat(ChatEnvironment environment, MessageTransport<T> transport);
}
