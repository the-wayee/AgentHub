package com.xiaoguai.agentx.application.conversation.service.agent.event;


import com.xiaoguai.agentx.application.conversation.service.agent.handler.AbstractAgentHandler;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-15 17:24
 * @Description: 事件总线
 */
public class AgentEventBus {

    private static final Logger logger = LoggerFactory.getLogger(AgentEventBus.class);

    private static final Map<AgentWorkflowStatus, AgentEventHandler> handlers = new ConcurrentHashMap<>();

    /**
     * 注册事件处理器
     */
    public static void register(AgentWorkflowStatus status, AgentEventHandler handler) {
        handlers.put(status, handler);
    }

    /**
     * 发布事件
     */
    public static <T> void publishEvent(AgentEvent<T> event) {
        AgentWorkflowStatus status = event.getToStatus();
        AgentEventHandler handler = handlers.get(status);
        if (handler != null) {
            try {
                if (((AbstractAgentHandler)handler).isBreak()) {
                    return;
                }
                handler.handle(event);
            } catch (Exception e) {
                logger.error("事件处理异常: {}", e.getMessage());
            }
        }
    }

}
