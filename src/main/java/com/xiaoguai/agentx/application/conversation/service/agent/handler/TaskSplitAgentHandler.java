package com.xiaoguai.agentx.application.conversation.service.agent.handler;


import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEvent;
import com.xiaoguai.agentx.application.conversation.service.agent.manager.ContextFillManager;
import com.xiaoguai.agentx.application.conversation.service.agent.manager.TaskManager;
import com.xiaoguai.agentx.application.conversation.service.agent.template.AgentPromptTemplates;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowContext;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowStatus;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.domain.task.model.TaskEntity;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
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
 * @Date: 2025-09-24 15:49
 * @Description: 任务拆解处理器
 */
@Component
public class TaskSplitAgentHandler extends AbstractAgentHandler {

    private static final Logger logger = LoggerFactory.getLogger(TaskSplitAgentHandler.class);

    private final ContextFillManager contextFillManager;
    private final TaskManager taskManager;

    protected TaskSplitAgentHandler(ConversationDomainService conversationDomainService, ContextFillManager contextFillManager, TaskManager taskManager) {
        super(conversationDomainService);
        this.contextFillManager = contextFillManager;
        this.taskManager = taskManager;
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

        MessageEntity userMessage = context.getUserMessage();
        MessageEntity assistMessage = context.getAssistMessage();
        // 获取大模型
        StreamingChatModel streamModel = getStreamModel(context);

        // 构建请求
        ChatRequest request = context.getChatContext().prepareRequest();
        List<ChatMessage> messages = new ArrayList<>(request.messages());
        messages.add(new UserMessage(AgentPromptTemplates.getDecompositionPrompt()));
        request = request.toBuilder().messages(messages).build();

        streamModel.chat(request, new StreamingChatResponseHandler() {
            @Override
            public void onPartialResponse(String s) {
                context.sendMessage(s, MessageType.TASK_SPLIT);
            }

            @Override
            public void onCompleteResponse(ChatResponse chatResponse) {
                String aiMessage = chatResponse.aiMessage().text();
                TokenUsage tokenUsage = chatResponse.tokenUsage();
                assistMessage.setTokenCount(tokenUsage.outputTokenCount());
                assistMessage.setContent(aiMessage);
                assistMessage.setMessageType(MessageType.TEXT);
                try {
                    List<String> tasks = splitTaskDescriptions(aiMessage);
                    if (tasks.isEmpty()) {
                        context.sendErrorMessage(new RuntimeException("任务拆分失败，未能识别子任务"));
                        return;
                    }

                    for (String task : tasks) {
                        // 创建子任务实体
                        TaskEntity subTask = taskManager.createSubTask(context.getParentTask().getId(),
                                task, context.getChatContext());
                        context.addSubTask(subTask);
                        context.sendTaskStartMessage(task,subTask.getId(), MessageType.TASK_SPLIT_FINISH);
                    }

                    // 更新上下文
                    saveAndUpdateContext(List.of(userMessage, assistMessage), context.getChatContext());
                    // 任务流转
                    context.transitionTo(AgentWorkflowStatus.TASK_SPLIT_COMPLETE);

                } catch (Exception e) {
                    logger.error("任务拆分阶段出错，{}", e.getMessage());
                    context.sendErrorMessage(e);
                }
            }

            @Override
            public void onError(Throwable throwable) {
                logger.error("任务拆分失败", throwable);
                context.sendErrorMessage(throwable);
            }
        });
    }


    /**
     * 将大模型返回的文本分割为子任务列表
     */
    private List<String> splitTaskDescriptions(String text) {
        List<String> tasks = new ArrayList<>();

        if (text == null || text.trim().isEmpty()) {
            return tasks;
        }

        String[] lines = text.split("\n");
        StringBuilder currentTask = new StringBuilder();

        for (String line : lines) {
            line = line.trim();

            // 跳过空行
            if (line.isEmpty()) {
                continue;
            }

            // 检测新任务的开始（支持更多格式）
            boolean isNewTask = line.matches("^\\d+[.、)].*") || // "1. 任务描述", "1、任务描述", "1)任务描述"
                    line.matches("^[-•*▪‣⁃].*") || // "- 任务描述", "• 任务描述" 等
                    line.matches("^任务\\s*\\d+.*") || // "任务1: 描述"
                    line.matches("^子任务\\s*\\d+.*") || // "子任务1: 描述"
                    line.matches("^[A-Z][.)].*") || // "A. 任务描述", "A)任务描述"
                    line.matches("^[a-z][.)].*"); // "a. 任务描述", "a)任务描述"

            // 移除任务标识符（如 "1. ", "- " 等）
            String cleanedLine = line.replaceAll("^[0-9]+[.、)]\\s*", "")
                    .replaceAll("^[-•*▪‣⁃]\\s*", "")
                    .replaceAll("^[子]?任务\\s*\\d+[:：]\\s*", "")
                    .replaceAll("^[A-Za-z][.)]\\s*", "");

            if (isNewTask && currentTask.length() > 0) {
                // 保存之前的任务
                tasks.add(currentTask.toString().trim());
                currentTask = new StringBuilder();
            }

            currentTask.append(cleanedLine).append("\n");
        }

        // 添加最后一个任务
        if (currentTask.length() > 0) {
            tasks.add(currentTask.toString().trim());
        }

        return tasks;
    }
}
