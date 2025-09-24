package com.xiaoguai.agentx.application.conversation.service.agent;


import com.xiaoguai.agentx.application.conversation.service.ChatContext;
import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEventBus;
import com.xiaoguai.agentx.application.conversation.service.agent.handler.AnalyzeAgentHandler;
import com.xiaoguai.agentx.application.conversation.service.agent.handler.TaskSplitAgentHandler;
import com.xiaoguai.agentx.application.conversation.service.agent.manager.ContextFillManager;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowContext;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowStatus;
import com.xiaoguai.agentx.application.conversation.service.chat.ChatMessageHandler;
import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;
import org.springframework.stereotype.Component;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 14:48
 * @Description: Agent消息处理器
 */
@Component
public class AgentMessageHandler extends ChatMessageHandler {

    private final ContextFillManager contextFillManager;
    private final AnalyzeAgentHandler analyzeAgentHandler;
    private final TaskSplitAgentHandler taskSplitAgentHandler;


    public AgentMessageHandler(ConversationDomainService conversationDomainService, ContextDomainService contextDomainService, ContextFillManager contextFillManager, AnalyzeAgentHandler analyzeAgentHandler, TaskSplitAgentHandler taskSplitAgentHandler) {
        super(conversationDomainService, contextDomainService);
        this.contextFillManager = contextFillManager;

        this.analyzeAgentHandler = analyzeAgentHandler;
        this.taskSplitAgentHandler = taskSplitAgentHandler;

        // 初始化处理器
        init();
    }

    public void init() {
        // 问题分析处理器
        AgentEventBus.register(AgentWorkflowStatus.ANALYZE, analyzeAgentHandler);

        // 任务分解处理器
        AgentEventBus.register(AgentWorkflowStatus.TASK_SPLIT, taskSplitAgentHandler);
    }

    @Override
    public <T> T handleChat(ChatContext environment, MessageTransport<T> transport) {
        String sessionId = environment.getSessionId();

        // 如果是补充信息，获取之前的工作流，进行sse的回复
        if (contextFillManager.isSupplement(sessionId)) {

        }

        // 创建连接
        T connection = transport.createConnection(CONNECTION_TIMEOUT);

        // TODO 创建父任务

        // 进入状态流程
        AgentWorkflowContext<T> workflow = new AgentWorkflowContext<>();
        workflow.setChatContext(environment);
        workflow.setConnection(connection);
        workflow.setAssistMessage(createAssistMessage(environment));
        workflow.setUserMessage(createUserMessage(environment));
        workflow.setTransport(transport);

        // 启动工作流
        workflow.transitionTo(AgentWorkflowStatus.ANALYZE);

        return connection;
    }
}
