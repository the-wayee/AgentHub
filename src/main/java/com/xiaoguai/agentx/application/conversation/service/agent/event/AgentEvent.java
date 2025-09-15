package com.xiaoguai.agentx.application.conversation.service.agent.event;


import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowContext;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowStatus;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-15 17:25
 * @Description: 事件
 */
public class AgentEvent<T> {

    /**
     * 工作流上下文
     */
    private AgentWorkflowContext<T>  context;

    /**
     * 上一个状态
     */
    private AgentWorkflowStatus fromStatus;

    /**
     * 上一个状态
     */
    private AgentWorkflowStatus toStatus;

    public AgentWorkflowContext<T> getContext() {
        return context;
    }

    public void setContext(AgentWorkflowContext<T> context) {
        this.context = context;
    }

    public AgentWorkflowStatus getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(AgentWorkflowStatus fromStatus) {
        this.fromStatus = fromStatus;
    }

    public AgentWorkflowStatus getToStatus() {
        return toStatus;
    }

    public void setToStatus(AgentWorkflowStatus toStatus) {
        this.toStatus = toStatus;
    }
}
