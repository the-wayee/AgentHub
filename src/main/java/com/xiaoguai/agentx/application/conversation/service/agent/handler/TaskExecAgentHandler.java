package com.xiaoguai.agentx.application.conversation.service.agent.handler;


import com.xiaoguai.agentx.application.conversation.service.agent.Agent;
import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEvent;
import com.xiaoguai.agentx.application.conversation.service.agent.manager.TaskManager;
import com.xiaoguai.agentx.application.conversation.service.agent.manager.ToolCallManager;
import com.xiaoguai.agentx.application.conversation.service.agent.template.AgentPromptTemplates;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowContext;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowStatus;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.domain.task.constants.TaskStatus;
import com.xiaoguai.agentx.domain.task.model.TaskEntity;
import dev.langchain4j.agent.tool.ToolExecutionRequest;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.tool.ToolProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-26 15:32
 * @Description: 任务执行处理器
 */
@Component
public class TaskExecAgentHandler extends AbstractAgentHandler {

    private static final Logger logger = LoggerFactory.getLogger(TaskExecAgentHandler.class);
    private final ToolCallManager toolCallManager;
    private final TaskManager taskManager;

    protected TaskExecAgentHandler(ConversationDomainService conversationDomainService, ToolCallManager toolCallManager, TaskManager taskManager) {
        super(conversationDomainService);
        this.toolCallManager = toolCallManager;
        this.taskManager = taskManager;
    }

    @Override
    public <T> boolean shouldHandle(AgentEvent<T> context) {
        return AgentWorkflowStatus.TASK_SPLIT_COMPLETE == context.getToStatus();
    }

    @Override
    public <T> void processEvent(AgentWorkflowContext<T> context) {
        try {
            // 提供工具调用
            ToolProvider toolProvider = toolCallManager.createToolProvider(toolCallManager.getAvailableTools());

            while (context.hasNextTask()) {
                // 获取当前需要执行的子任务
                String currentTask = context.getCurrentTask();
                if (currentTask == null) {
                    break;
                }

                // 执行子任务
                execSubTask(currentTask, context, toolProvider);

                // 更新父任务进度
                taskManager.updateTaskProgress(context.getParentTask(),
                        context.getCompleteTaskCount(),
                        context.getTotalTaskCount());
            }
        } catch (Exception e) {
            context.sendErrorMessage(e);
        }
    }


    @Override
    public <T> void transitionTo(AgentWorkflowContext<T> context) {
        context.transitionTo(AgentWorkflowStatus.TASK_EXECUTE_COMPLETE);
    }


    /**
     * 执行子任务
     */
    private <T> void execSubTask(String currentTask, AgentWorkflowContext<T> context, ToolProvider toolProvider) {

        TaskEntity task = context.getSubTasks().get(currentTask);
        String taskId = task.getId();

        try {
            // 发送任务开始消息（包含任务内容和taskId）
            context.sendTaskStartMessage(currentTask, taskId, MessageType.TASK_EXEC);

            // 前端展示消息id正在执行
            context.sendTaskEndMessage(taskId, MessageType.TASK_STATUS_TO_LOADING);

            // 保存消息执行
            MessageEntity taskMessage = createMessage(context.getChatContext(), currentTask, MessageType.TASK_EXEC, 0);
            saveAndUpdateContext(List.of(taskMessage), context.getChatContext());

            // 获取原始任务
            TaskEntity parentTask = context.getParentTask();

            // 获取之前的任务结果
            Map<String, String> tasksResult = context.getSubTasksResult();

            // 获取任务执行提示词
            String prompt = AgentPromptTemplates.getTaskExecutionPrompt(parentTask.getTaskName(), currentTask, tasksResult);

            // TODO 更换为 streamChatModel
            ChatModel model = getChatModel(context);

            // 创建Agent service
            Agent agent = AiServices.builder(Agent.class)
                    .chatModel(model)
                    .toolProvider(toolProvider)
                    .build();
            AiMessage aiMessage = agent.chat(prompt);

            // 如果有工具调用
            if (aiMessage.hasToolExecutionRequests()) {
                handlerToolCalls(aiMessage, context);
            }
            // 请求结果
            String result = aiMessage.text();

            // 设置工作结果
            context.setTaskResult(currentTask, result);
            // 通知前端消息完成
            context.sendTaskEndMessage(taskId, MessageType.TASK_STATUS_TO_FINISH);
            taskManager.completeTask(task, result);
        } catch (Exception e) {
            logger.error("任务执行失败: {}", e.getMessage());
            context.sendErrorMessage(e);
            // 仍然执行其他子任务
            task.setTaskResult("任务执行失败: " + e.getMessage());
            context.setTaskResult(currentTask, "执行失败: " + e.getMessage());
            taskManager.updateTaskStatus(task, TaskStatus.FAILED);
            context.sendEndMessage("任务 " + currentTask + "执行失败: " + e.getMessage(), MessageType.TEXT);
        }
    }

    /**
     * 处理工具调用
     */
    private <T> void handlerToolCalls(AiMessage aiMessage, AgentWorkflowContext<T> context) {
        MessageEntity message = createMessage(context.getChatContext(), null, MessageType.TOOL_CALL, 0);
        StringBuilder toolCallContent = new StringBuilder("正在执行工具调用: \n");
        for (ToolExecutionRequest tool : aiMessage.toolExecutionRequests()) {
            String toolName = tool.name();
            toolCallContent.append("- ").append(toolName).append("\n");
            // 告诉前端消息调用
            context.sendEndMessage(toolName, MessageType.TOOL_CALL);
        }
        message.setContent(toolCallContent.toString());
        // 保存消息调用信息
        saveMessage(message);
    }
}
