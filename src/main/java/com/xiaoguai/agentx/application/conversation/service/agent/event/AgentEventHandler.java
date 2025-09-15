package com.xiaoguai.agentx.application.conversation.service.agent.event;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-15 17:25
 * @Description: 事件实现接口
 */
public interface AgentEventHandler {

    <T> void handle(AgentEvent<T> event);
}
