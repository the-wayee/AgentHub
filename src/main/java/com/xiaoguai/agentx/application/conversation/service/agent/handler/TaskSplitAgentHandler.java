package com.xiaoguai.agentx.application.conversation.service.agent.handler;


import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEvent;
import com.xiaoguai.agentx.application.conversation.service.agent.manager.ContextFillManager;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowContext;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowStatus;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-24 15:49
 * @Description: 任务拆解处理器
 */
@Component
public class TaskSplitAgentHandler extends AbstractAgentHandler {

    private static final Logger logger = LoggerFactory.getLogger(TaskSplitAgentHandler.class);

    private final ContextFillManager contextFillManager;

    protected TaskSplitAgentHandler(ConversationDomainService conversationDomainService, ContextFillManager contextFillManager) {
        super(conversationDomainService);
        this.contextFillManager = contextFillManager;
    }

    @Override
    public <T> boolean shouldHandle(AgentEvent<T> context) {
        return context.getToStatus() == AgentWorkflowStatus.TASK_SPLIT;
    }

    @Override
    public <T> void processEvent(AgentWorkflowContext<T> context) {
        contextFillManager.checkInfoComplete(context)
                .thenAccept(action -> {
                    // 如果信息完整
                    if (action) {
                        // 进行任务拆分
                        doSplitTask(context);
                    }
                });
    }

    @Override
    public <T> void transitionTo(AgentWorkflowContext<T> context) {
        // 将在doSplitTask的请求回调中，手动处理状态转移
    }

    /**
     * 做任务拆分
     */
    private void doSplitTask(AgentWorkflowContext<?> context) {
        logger.info("===========>{}", "任务拆解完成");
    }
}
