package com.xiaoguai.agentx.domain.conversation.handler;


import com.xiaoguai.agentx.application.conversation.dto.AgentChatResponse;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import com.xiaoguai.agentx.domain.conversation.factory.MessageFactory;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.domain.task.constants.TaskStatus;
import com.xiaoguai.agentx.domain.task.model.TaskEntity;
import com.xiaoguai.agentx.domain.task.service.TaskDomainService;
import com.xiaoguai.agentx.infrastrcture.llm.LlmProviderService;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.mcp.client.DefaultMcpClient;
import dev.langchain4j.mcp.client.McpClient;
import dev.langchain4j.mcp.client.transport.McpTransport;
import dev.langchain4j.mcp.client.transport.http.HttpMcpTransport;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.request.ChatRequestParameters;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.model.openai.OpenAiChatRequestParameters;
import dev.langchain4j.model.output.TokenUsage;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.tool.ToolProvider;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 14:48
 * @Description: Agent消息处理器
 */
@Component
public class AgentMessageHandler extends ChatMessageHandler {

    private final TaskDomainService taskDomainService;

    private final ExecutorService contextExecutorService;


    public AgentMessageHandler(ConversationDomainService conversationDomainService,
                               ContextDomainService contextDomainService, TaskDomainService taskDomainService, ExecutorService contextExecutorService) {
        super(conversationDomainService, contextDomainService);
        this.taskDomainService = taskDomainService;
        this.contextExecutorService = contextExecutorService;
    }


    // 任务拆分提示词 测试过程用的
    String decompositionTestPrompt =
            "你是一个专业的任务规划专家，请根据用户的需求，将复杂任务分解为合理的子任务序列,只拆分为3条子任务。请分解为合理的子任务序列，直接以数字编号的形式列出，无需额外解释";

    // 任务拆分提示词
    String decompositionPrompt =
            "你是一个专业的任务规划专家，请根据用户的需求，将复杂任务分解为合理的子任务序列。" +
                    "在分解任务时，请考虑以下几点：" +
                    "\n1. 充分理解用户的真实需求和背景，挖掘潜在的子任务" +
                    "\n2. 子任务应该覆盖问题解决的整个过程，确保完整性" +
                    "\n3. 根据任务的复杂度，决定合适的子任务粒度和数量" +
                    "\n4. 子任务应按照合理的顺序排列，确保执行的流畅性" +
                    "\n5. 子任务描述应面向用户，清晰易懂，避免技术术语" +
                    "\n6. 创造性地考虑用户可能忽略的方面，提供全面的规划" +
                    "\n\n以下是用户的需求：" +
                    "\n\n请分解为合理的子任务序列，直接以数字编号的形式列出，无需额外解释。";

    // 任务结果汇总提示词
    private final String summaryPrompt = "你是一个高效的任务结果整合专家。我已经完成了以下子任务，请根据这些子任务的结果，提供一个全面、连贯且条理清晰的总结。" +
            "总结应该：" +
            "\n1. 融合所有子任务的关键信息" +
            "\n2. 消除重复内容" +
            "\n3. 使用简洁明了的语言" +
            "\n4. 保持专业性和准确性" +
            "\n5. 按逻辑顺序组织内容" +
            "\n\n以下是各子任务及其结果：\n%s" +
            "\n\n请提供一个全面的总结:";

    private List<String> getTools() {
        return new ArrayList<>();
    }

    interface Agent {
        AiMessage chat(String content);
    }

    @Override
    public <T> T handleChat(ChatEnvironment environment, MessageTransport<T> transport) {
        // 创建用户消息
        MessageEntity userMessage = MessageFactory.createUserMessage(environment);
        // 创建llm消息
        MessageEntity assistMessage = MessageFactory.createAssistMessage(environment);
        // 创建连接
        T connection = transport.createConnection(CONNECTION_TIMEOUT);

        // 获取llm客户端
        StreamingChatModel chatModel = LlmProviderService.getStreamModel(environment.getProviderEntity().getProtocol(), environment.getProviderEntity().getConfig());

        // 第一步，创建父任务
        TaskEntity parentTask = new TaskEntity();
        parentTask.setTaskName(environment.getUserMessage());
        parentTask.setParentTaskId("0");
        parentTask.setStatus(TaskStatus.WAITING);
        parentTask.setProgress(0);
        parentTask.setUserId(environment.getUserId());
        parentTask.setSessionId(environment.getSessionId());

        // 保存父任务
        taskDomainService.addTask(parentTask);

        // 异步执行任务拆分和子任务
        contextExecutorService.execute(() -> {
            // 第二步，准备拆分请求
            ChatRequest splitTaskRequest = prepareSplitTaskRequest(environment);

            // 子任务
            List<TaskEntity> subTasks = new ArrayList<>();
            CompletableFuture<Boolean> splitTaskFuture = new CompletableFuture<>();

            // 拆分任务
            splitTasks(environment, transport, connection,
                    chatModel, userMessage, assistMessage, parentTask,
                    subTasks, splitTaskRequest, splitTaskFuture);

            // 等待拆分完成
            try {
                Boolean splitComplete = splitTaskFuture.get(300, TimeUnit.MINUTES);
                if (!splitComplete) {
                    // 处理任务拆分失败
                    AgentChatResponse timeoutResponse = AgentChatResponse.build(
                            "任务拆分失败", true, false, MessageType.TEXT);
                    transport.sendMessage(connection, timeoutResponse);
                    transport.completeConnection(connection);
                    return;
                }
            } catch (Exception e) {
                // 处理等待异常
                AgentChatResponse errorResponse = AgentChatResponse.build(
                        "任务拆分过程发生错误: " + e.getMessage(), true, false, MessageType.TEXT);
                transport.sendMessage(connection, errorResponse);
                transport.completeConnection(connection);
                return;
            }

            // 保存用户和拆分消息
            conversationDomainService.saveMessages(List.of(userMessage, assistMessage));

            // 更新上下文
            List<String> activeMessages = environment.getContextEntity().getActiveMessages();
            activeMessages.add(userMessage.getId());
            activeMessages.add(assistMessage.getId());
            contextDomainService.insertOrUpdate(environment.getContextEntity());

            // 第三步 配置MCP
            List<String> toolUrls = getTools();
            ToolProvider toolProvider = null;
            List<McpClient> mcpClients = new ArrayList<>();
            toolUrls.forEach(toolUrl -> {
                McpTransport mcpTransPort = new HttpMcpTransport.Builder()
                        .sseUrl(toolUrl)
                        .logRequests(true)
                        .logResponses(true)
                        .build();

                McpClient mcpClient = new DefaultMcpClient.Builder()
                        .transport(mcpTransPort)
                        .build();
                mcpClients.add(mcpClient);
            });

            toolProvider = McpToolProvider.builder()
                    .mcpClients(mcpClients)
                    .build();

            // 第四步 执行子任务
            Map<String, String> subTaskResults = new HashMap<>();
            AtomicInteger completedTaskCount = new AtomicInteger(0);
            for (TaskEntity subTask : subTasks) {
                // 更新任务进度
                subTask.updateStatus(TaskStatus.PROGRESSING);
                taskDomainService.updateTask(subTask);

                // 保存执行消息
                String taskName = subTask.getTaskName();

                MessageEntity taskExecMessage = new MessageEntity();
                taskExecMessage.setContent(taskName);
                taskExecMessage.setMessageType(MessageType.TASK_EXEC);
                taskExecMessage.setTokenCount(0);
                conversationDomainService.saveMessage(taskExecMessage);

                // 通知前端当前执行任务
                AgentChatResponse taskCallNotificationResponse = AgentChatResponse.build(taskName, false, false, MessageType.TASK_EXEC);
                taskCallNotificationResponse.setTaskId(subTask.getId());
                transport.sendMessage(connection, taskCallNotificationResponse);

                // 构建子任务上下文，携带之前的任务结果
                StringBuilder contextBuilder = new StringBuilder();
                contextBuilder.append("当前任务：").append(taskName).append("\n\n");
                if (!subTaskResults.isEmpty()) {
                    contextBuilder.append("之前执行的任务及结果: \n");
                    subTaskResults.forEach((name, result) -> {
                        contextBuilder.append("- 任务").append(completedTaskCount.get()).append(": ").append(name).append("\n");
                        contextBuilder.append("- 结果: ").append(result).append("\n");
                    });
                }

                // 执行当前任务
                ChatModel model = LlmProviderService.getChatModel(environment.getProviderEntity().getProtocol(), environment.getProviderEntity().getConfig());
                // 携带工具调用
                Agent agent = AiServices.builder(Agent.class)
                        .chatModel(model)
                        .toolProvider(toolProvider)
                        .build();
                AiMessage aiMessage = agent.chat(contextBuilder.toString());

                // 如果有工具调用
                if (aiMessage.hasToolExecutionRequests()) {
                    MessageEntity toolCallMessageEntity = MessageFactory.createAssistMessage(environment);
                    toolCallMessageEntity.setMessageType(MessageType.TOOL_CALL);
                    StringBuilder toolCallMessageBuilder = new StringBuilder("工具调用: \n");
                    aiMessage.toolExecutionRequests().forEach(tool -> {
                        toolCallMessageBuilder.append("- ").append(tool.name()).append("\n");

                        // 返回前端，工具调用信息
                        AgentChatResponse response = AgentChatResponse.build(tool.name(), true, false, MessageType.TOOL_CALL);
                        transport.sendMessage(connection, response);
                    });
                    // 保存工具调用消息
                    toolCallMessageEntity.setContent(toolCallMessageBuilder.toString());
                    toolCallMessageEntity.setTokenCount(0);
                    conversationDomainService.saveMessage(toolCallMessageEntity);

                    // 更新上下文
                    activeMessages.add(toolCallMessageEntity.getId());

                }

                // 任务执行结果
                String taskResult = aiMessage.text();
                subTaskResults.put(taskName, taskResult);
                // 保存任务执行结果，标记为已完成
                subTask.setTaskResult(taskResult);
                subTask.updateStatus(TaskStatus.COMPLETED);
                taskDomainService.updateTask(subTask);

                // 向前端发送任务完成消息
                taskCallNotificationResponse.setMessageType(MessageType.TASK_STATUS_TO_FINISH);
                transport.sendMessage(connection, taskCallNotificationResponse);

                // 更新父任务进度
                int completedCount = completedTaskCount.incrementAndGet();
                int progress = (int) (completedCount / (double) subTasks.size()) * 100;
                parentTask.updateProgress(progress);
                taskDomainService.updateTask(parentTask);
            }

            // 第五步 汇总任务执行结果
            StringBuilder taskSummaryBuilder = new StringBuilder();
            subTaskResults.forEach((name, result) -> {
                taskSummaryBuilder.append("- 任务: ").append(name).append("\n");
                taskSummaryBuilder.append("- 结果: ").append(result).append("\n");
            });

            String taskSummary = taskSummaryBuilder.toString();
            MessageEntity summaryMessage = MessageFactory.createAssistMessage(environment);
            summarizeResults(environment, transport,
                    connection, chatModel, parentTask,
                    taskSummary, summaryMessage);
        });
        // 返回连接给前端
        return connection;
    }


    /**
     * 预留工具调用
     *
     * @param toolName   工具名称
     * @param parameters 参数
     */
    protected Object invokeTools(String toolName, Object parameters) {
        return null;
    }

    /**
     * 准备拆分对话请求
     *
     * @param environment 对话环境
     */
    private ChatRequest prepareSplitTaskRequest(ChatEnvironment environment) {
        List<ChatMessage> messages = new ArrayList<>();

        // 用户消息
        UserMessage userMessage = new UserMessage(environment.getUserMessage());
        messages.add(userMessage);
        // 拆分消息提示词
        SystemMessage prompt = new SystemMessage(decompositionTestPrompt);
        messages.add(prompt);

        // 参数
        OpenAiChatRequestParameters parameters = OpenAiChatRequestParameters.builder()
                .modelName(environment.getModelEntity().getModelId())
                .topP(environment.getLlmModelConfig().getTopP())
                .temperature(environment.getLlmModelConfig().getTemperature())
                .build();

        return ChatRequest.builder()
                .messages(messages)
                .parameters(parameters)
                .build();
    }


    /**
     * 拆分任务
     *
     * @param environment      对话环境
     * @param transport        传输对象
     * @param connection       连接
     * @param chatModel        llm对话客户端
     * @param userMessage      用户消息
     * @param assistMessage    llm消息
     * @param parentTask       父任务
     * @param subTasks         子任务列表
     * @param splitTaskRequest 拆分任务请求
     * @param splitTaskFuture  拆分任务future
     * @param <T>
     */
    private <T> void splitTasks(ChatEnvironment environment,
                                MessageTransport<T> transport,
                                T connection,
                                StreamingChatModel chatModel,
                                MessageEntity userMessage,
                                MessageEntity assistMessage,
                                TaskEntity parentTask,
                                List<TaskEntity> subTasks,
                                ChatRequest splitTaskRequest,
                                CompletableFuture<Boolean> splitTaskFuture) {

        chatModel.chat(splitTaskRequest, new StreamingChatResponseHandler() {

            @Override
            public void onPartialResponse(String partialResponse) {
                AgentChatResponse response = AgentChatResponse.build(partialResponse, false, false, MessageType.TEXT);
                transport.sendMessage(connection, response);
            }

            @Override
            public void onCompleteResponse(ChatResponse completeResponse) {
                // 获取token使用情况
                TokenUsage tokenUsage = completeResponse.tokenUsage();
                // 设置用户token情况
                Integer inputTokenCount = tokenUsage.inputTokenCount();
                userMessage.setTokenCount(inputTokenCount);

                // 获取大模型token使用情况和完整消息
                Integer outputTokenCount = tokenUsage.outputTokenCount();
                assistMessage.setTokenCount(outputTokenCount);
                String taskStr = completeResponse.aiMessage().text();
                assistMessage.setContent(taskStr);

                // 转换大模型返回任务
                List<String> tasks = parseTasks(taskStr);

                for (String task : tasks) {
                    TaskEntity taskEntity = new TaskEntity();
                    taskEntity.setTaskName(task);
                    taskEntity.setParentTaskId(parentTask.getId());
                    taskEntity.setSessionId(environment.getSessionId());
                    taskEntity.setUserId(environment.getUserId());
                    taskEntity.updateStatus(TaskStatus.WAITING);

                    // 保存子任务列表
                    subTasks.add(taskEntity);
                }

                // 标记任务完成
                AgentChatResponse finishResponse = AgentChatResponse.build("", true, false, MessageType.TASK_SPLIT_FINISH);
                transport.sendMessage(connection, finishResponse);
                splitTaskFuture.complete(true);
            }

            @Override
            public void onError(Throwable error) {
                try {
                    transport.handleError(connection, error);
                } finally {
                    // 发生错误时标记任务拆分失败
                    splitTaskFuture.completeExceptionally(error);
                }
                try {
                    transport.handleError(connection, error);
                } finally {
                    // 发生错误时标记任务拆分失败
                    splitTaskFuture.completeExceptionally(error);
                }
            }
        });


    }

    /**
     * 转换为task列表
     *
     * @param taskStr 任务描述
     */
    private List<String> parseTasks(String taskStr) {
        return Arrays.stream(taskStr.split("\n"))
                .map(String::trim)
                .filter(String::isBlank)
                .toList();
    }


    /**
     * 总结最后任务
     */
    private <T> void summarizeResults(ChatEnvironment environment,
                                      MessageTransport<T> transport,
                                      T connection,
                                      StreamingChatModel chatModel,
                                      TaskEntity parentTask,
                                      String taskSummary,
                                      MessageEntity summaryMessage) {
        // 构建汇总请求
        List<ChatMessage> messages = new ArrayList<>();
        // 添加系统提示词
        messages.add(new UserMessage("请基于上述子任务总结"));
        // 用户请求
        messages.add(new SystemMessage(String.format(summaryPrompt, taskSummary)));

        ChatRequestParameters parameters = ChatRequestParameters.builder()
                .modelName(environment.getModelEntity().getModelId())
                .topK(environment.getLlmModelConfig().getTopK())
                .temperature(environment.getLlmModelConfig().getTemperature())
                .build();

        ChatRequest chatRequest = ChatRequest.builder()
                .messages(messages)
                .parameters(parameters)
                .build();

        chatModel.chat(chatRequest, new StreamingChatResponseHandler() {

            @Override
            public void onPartialResponse(String partialResponse) {
                AgentChatResponse response = AgentChatResponse.build(partialResponse, false, false, MessageType.TEXT);
                transport.sendMessage(connection, response);
            }

            @Override
            public void onCompleteResponse(ChatResponse completeResponse) {
                TokenUsage tokenUsage = completeResponse.tokenUsage();

                // Llm token使用量
                Integer outputTokenCount = tokenUsage.outputTokenCount();
                summaryMessage.setTokenCount(outputTokenCount);
                String summary = completeResponse.aiMessage().text();
                summaryMessage.setContent(summary);
                summaryMessage.setMessageType(MessageType.TEXT);

                // 更新父任务
                parentTask.setTaskResult(summary);
                parentTask.updateStatus(TaskStatus.COMPLETED);
                taskDomainService.updateTask(parentTask);

                // 发送前端消息，标记任务完成
                AgentChatResponse response = AgentChatResponse.build("", true, false, MessageType.TASK_STATUS_TO_FINISH);
                transport.sendMessage(connection, response);
                transport.completeConnection(connection);

                // 更新上下文
                conversationDomainService.saveMessage(summaryMessage);
                List<String> activeMessages = environment.getContextEntity().getActiveMessages();
                activeMessages.add(summaryMessage.getId());
                contextDomainService.insertOrUpdate(environment.getContextEntity());

                // 结束

            }

            @Override
            public void onError(Throwable error) {
                transport.handleError(connection, error);
            }
        });
    }
}
