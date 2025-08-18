package com.xiaoguai.agentx.infrastrcture.transport;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 10:18
 * @Description: TODO Websocket消息传输
 */
public class WebsocketMessageTransport implements MessageTransport{
    @Override
    public Object createConnection(long timeout) {
        return null;
    }

    @Override
    public void sendMessage(Object connection, String content, boolean isDone, boolean isReasoning, String provider, String model) {

    }

    @Override
    public void completeConnection(Object connection) {

    }

    @Override
    public void handlerError(Object connection, Throwable ex) {

    }
}
