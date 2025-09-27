package com.xiaoguai.agentx.application.conversation.service.agent.handler;


import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEvent;
import com.xiaoguai.agentx.application.conversation.service.agent.manager.TaskManager;
import com.xiaoguai.agentx.application.conversation.service.agent.template.AgentPromptTemplates;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowContext;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowStatus;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.model.output.TokenUsage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-27 14:17
 * @Description: 任务总结处理器
 */
@Component
public class SummarizeAgentHandler extends AbstractAgentHandler {
    private static final Logger logger = LoggerFactory.getLogger(SummarizeAgentHandler.class);

    private final TaskManager taskManager;

    protected SummarizeAgentHandler(ConversationDomainService conversationDomainService, TaskManager taskManager) {
        super(conversationDomainService);
        this.taskManager = taskManager;
    }

    @Override
    public <T> boolean shouldHandle(AgentEvent<T> context) {
        return context.getToStatus() == AgentWorkflowStatus.TASK_EXECUTE_COMPLETE;
    }

    @Override
    public <T> void processEvent(AgentWorkflowContext<T> context) {
        // 构建汇总消息
        MessageEntity summaryMessage = createMessage(context.getChatContext(), null, MessageType.TEXT, 0);

        // 获取对话模型
        StreamingChatModel streamModel = getStreamModel(context);
        ChatRequest chatRequest = buildChatRequest(context);

        streamModel.chat(chatRequest, new StreamingChatResponseHandler() {
            @Override
            public void onPartialResponse(String s) {
                context.sendMessage(s, MessageType.TEXT);
            }

            @Override
            public void onCompleteResponse(ChatResponse chatResponse) {
                TokenUsage tokenUsage = chatResponse.tokenUsage();
                summaryMessage.setTokenCount(tokenUsage.outputTokenCount());
                String summary = chatResponse.aiMessage().text();
                summaryMessage.setContent(summary);

                // 保存消息
                saveAndUpdateContext(List.of(summaryMessage), context.getChatContext());

                // 完成父任务
                taskManager.completeTask(context.getParentTask(), summary);

                // 发送最后消息并断开连接
                context.sendEndMessage(MessageType.TEXT);
                context.completeConnection();

                context.transitionTo(AgentWorkflowStatus.COMPLETED);
            }

            @Override
            public void onError(Throwable throwable) {
                logger.error("总结消息失败，{}", throwable.getMessage());
                context.sendErrorMessage(throwable);
            }
        });
    }

    @Override
    public <T> void transitionTo(AgentWorkflowContext<T> context) {
        context.transitionTo(AgentWorkflowStatus.SUMMERIZE);
    }

    private ChatRequest buildChatRequest(AgentWorkflowContext<?> context) {
        List<ChatMessage> messages = new ArrayList<>();

        messages.add(new UserMessage(AgentPromptTemplates.getSummaryPrompt(context.getSummaryResult())));
        messages.add(new UserMessage("请基于上述子任务结果提供总结"));

        return buildChatRequest(context.getChatContext(), messages);
    }
}
