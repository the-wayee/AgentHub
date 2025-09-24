package com.xiaoguai.agentx.application.conversation.service.agent.handler;


import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEvent;
import com.xiaoguai.agentx.application.conversation.service.agent.manager.ContextFillManager;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowContext;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowStatus;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import org.springframework.stereotype.Component;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-24 15:49
 * @Description: 任务拆解处理器
 */
@Component
public class TaskSplitAgentHandler extends AbstractAgentHandler {


    protected TaskSplitAgentHandler(ConversationDomainService conversationDomainService, ContextFillManager contextFillManager) {
        super(conversationDomainService, contextFillManager);
    }

    @Override
    public <T> boolean shouldHandle(AgentEvent<T> context) {
        return context.getToStatus() == AgentWorkflowStatus.TASK_SPLIT;
    }

    @Override
    public <T> void processEvent(AgentWorkflowContext<T> context) {

    }

    @Override
    public <T> void transitionTo(AgentWorkflowContext<T> context) {

    }
}
