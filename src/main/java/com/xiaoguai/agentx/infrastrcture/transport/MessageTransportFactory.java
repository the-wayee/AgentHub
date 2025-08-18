package com.xiaoguai.agentx.infrastrcture.transport;


import java.util.concurrent.ConcurrentHashMap;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 10:14
 * @Description: 消息传输接口工厂
 */
public class MessageTransportFactory {

    /**
     * 传输类型：{SSE,WEBSOCKET}
     */
    public static final String TRANSPORT_TYPE_SSE = "sse";
    public static final String TRANSPORT_TYPE_WEBSOCKET = "websocket";

    private static final ConcurrentHashMap<String, MessageTransport<?>> transports = new ConcurrentHashMap<>();

    static {
        transports.put(TRANSPORT_TYPE_SSE, new SseMessageTransport());
        transports.put(TRANSPORT_TYPE_WEBSOCKET, new WebsocketMessageTransport());
    }

    /**
     * 获取指定类型的传输对象
     * @param transportType 传输类型
     * @return 传输对象
     */
    @SuppressWarnings("unchecked")
    public static <T> MessageTransport<T> getTransport(String transportType) {
        return (MessageTransport<T>) transports.get(transportType);
    }
}
