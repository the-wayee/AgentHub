package com.xiaoguai.agentx.application.conversation.service.agent.handler;


import com.xiaoguai.agentx.application.conversation.service.ChatContext;
import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEvent;
import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEventHandler;
import com.xiaoguai.agentx.application.conversation.service.agent.manager.ContextFillManager;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowContext;
import com.xiaoguai.agentx.domain.conversation.constants.Role;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.infrastrcture.llm.LlmProviderService;
import dev.langchain4j.model.chat.ChatModel;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-15 17:58
 * @Description: 抽象事件处理器
 */

public abstract class AbstractAgentHandler implements AgentEventHandler {

    private final ConversationDomainService conversationDomainService;

    private final ContextFillManager contextFillManager;

    private boolean isBreak = false;

    protected AbstractAgentHandler(ConversationDomainService conversationDomainService, ContextFillManager contextFillManager) {
        this.conversationDomainService = conversationDomainService;
        this.contextFillManager = contextFillManager;
    }


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



    /**
     * 获取标准客户端
     */
    protected ChatModel getChatModel(AgentWorkflowContext<?> context) {
        return LlmProviderService.getChatModel(context.getChatContext().getProviderEntity().getProtocol(),
                context.getChatContext().getProviderEntity().getConfig());
    }

    /**
     * 保存并且更新上下文
     */
    protected void saveAndUpdateContext(List<MessageEntity> messages, ChatContext context) {
        conversationDomainService.saveMessagesToContext(messages, context.getContextEntity());
    }

    /**
     * 创建用户消息
     */
    protected MessageEntity createUserMessage(ChatContext environment) {
        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setRole(Role.USER);
        messageEntity.setContent(environment.getUserMessage());
        messageEntity.setSessionId(environment.getSessionId());
        return messageEntity;
    }

    /**
     * 创建助手消息
     */
    protected MessageEntity createAssistMessage(ChatContext environment) {
        MessageEntity message = new MessageEntity();
        message.setProvider(environment.getProviderEntity().getId());
        message.setModel(environment.getModelEntity().getModelId());
        message.setRole(Role.ASSISTANT);
        message.setSessionId(environment.getSessionId());
        return message;
    }


    /**
     * 设置工作流中断标记
     */
    public void setBreak(boolean isBreak) {
        this.isBreak = isBreak;
    }

    public boolean isBreak() {
        return isBreak;
    }
}
