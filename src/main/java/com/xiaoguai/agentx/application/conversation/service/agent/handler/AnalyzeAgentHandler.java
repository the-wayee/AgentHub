package com.xiaoguai.agentx.application.conversation.service.agent.handler;


import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEvent;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowContext;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowStatus;
import org.springframework.stereotype.Component;

/**
 * 分析问题处理器
 */
@Component
public class AnalyzeAgentHandler extends AbstractAgentHandler {


    @Override
    public <T> boolean shouldHandle(AgentEvent<T> context) {
        return context.getFromStatus() == AgentWorkflowStatus.ANALYZE;
    }

    @Override
    public <T> void processEvent(AgentWorkflowContext<T> context) {

    }

    @Override
    public <T> void transitionTo(AgentWorkflowContext<T> context) {

    }
}
