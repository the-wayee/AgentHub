package com.xiaoguai.agentx.application.conversation.service.agent.handler;


import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEvent;
import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEventHandler;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowContext;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-15 17:58
 * @Description: 抽象事件处理器
 */
public abstract class AbstractAgentHandler implements AgentEventHandler {


    @Override
    public <T> void handle(AgentEvent<T> event) {
        if (shouldHandle(event)) {
            AgentWorkflowContext<T> context = event.getContext();
            processEvent(context);
            transitionTo(context);
        }
    }

    /**
     * 是否需要处理 - 由子类实现
     */
    public abstract <T> boolean shouldHandle(AgentEvent<T> context);

    /**
     * 处理当前任务 - 由子类实现
     */
    public abstract <T> void processEvent(AgentWorkflowContext<T> context);

    /**
     * 工作流状态转移 - 由子类实现
     */
    public abstract <T> void transitionTo(AgentWorkflowContext<T> context);

}
