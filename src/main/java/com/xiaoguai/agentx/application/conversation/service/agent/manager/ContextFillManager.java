package com.xiaoguai.agentx.application.conversation.service.agent.manager;


import com.alibaba.fastjson2.JSON;
import com.xiaoguai.agentx.application.conversation.service.ChatContext;
import com.xiaoguai.agentx.application.conversation.service.agent.dto.InfoRequirementDTO;
import com.xiaoguai.agentx.application.conversation.service.agent.template.AgentPromptTemplates;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowContext;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import com.xiaoguai.agentx.domain.conversation.constants.Role;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.infrastrcture.llm.LlmProviderService;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-15 18:13
 * @Description: 上下文填充管理 - 用于补充额外信息
 */
@Component
public class ContextFillManager {

    private static final Logger logger = LoggerFactory.getLogger(ContextFillManager.class);

    private final ConversationDomainService conversationDomainService;

    /**
     * 等待用户补充的Future
     * k -> sessionId
     * v -> 用户补充的future
     */
    private static final Map<String, CompletableFuture<String>> WAITING_FUTURE = new ConcurrentHashMap<>();

    /**
     * 会话阻塞的上下文情况
     * k -> sessionId
     * v -> workflow
     */
    private static final Map<String, AgentWorkflowContext<?>> BLOCKING_CONTEXT = new ConcurrentHashMap<>();


    private static final int MAX_RETRY_TIME = 2;

    public ContextFillManager(ConversationDomainService conversationDomainService) {
        this.conversationDomainService = conversationDomainService;
    }


    /**
     * 判断用户信息是否完整
     *
     * @param context    工作流上下文
     * @param retryTimes 重试次数
     */
    private CompletableFuture<Boolean> checkInfoComplete(AgentWorkflowContext<?> context,
                                                         int retryTimes) {
        String sessionId = context.getChatContext().getSessionId();
        String userMessage = context.getChatContext().getUserMessage();


        // 最大重复次数
        if (retryTimes > MAX_RETRY_TIME) {
            logger.info("会话{}达到最大补充次数，准备流转下一个状态", sessionId);

            // 清除补充标志
            WAITING_FUTURE.remove(sessionId);
            BLOCKING_CONTEXT.remove(sessionId);

            context.sendEndMessage("已尝试多次获取信息，将基于已有信息继续处理", MessageType.TEXT);

            // 返回完整标识
            return CompletableFuture.completedFuture(true);
        }

        MessageEntity assistMessage = createAssistMessage(context.getChatContext());
        // 构建历史上下文消息
        ChatRequest chatRequest = buildRequest(context);

        // 添加用户消息
        chatRequest.messages().add(new UserMessage(userMessage));

        // 添加系统提示词
        chatRequest.messages().add(new SystemMessage(AgentPromptTemplates.getInfoAnalysisPrompt()));
        try {
            // 获取请求客户端
            ChatModel chatModel = getChatModel(context);

            // 发送问答请求
            String result = chatModel.chat(chatRequest).aiMessage().text();

            // 解析返回JSON数据
            InfoRequirementDTO infoRequirementDTO = JSON.parseObject(result, InfoRequirementDTO.class);

            if (infoRequirementDTO == null) {
                logger.error("数据解析失败，原始响应：{}", result);
                return CompletableFuture.completedFuture(false);
            }

            // 消息完整
            if (infoRequirementDTO.isInfoComplete()) {
                // 清楚标记
                WAITING_FUTURE.remove(sessionId);
                BLOCKING_CONTEXT.remove(sessionId);
                return CompletableFuture.completedFuture(true);
            }

            // 消息不完整，需要补充消息
            String requirement = infoRequirementDTO.getMissingInfoPrompt();
            assistMessage.setContent(requirement);

            MessageEntity userMessage1 = createUserMessage(context.getChatContext());

            logger.info("会话{} 不完整，等待用户补充{}", sessionId, requirement);

            // 更新工作流上下文
            context.getChatContext().getHistoryMessages().addAll(List.of(assistMessage, userMessage1));

            // 保存用户和助手信息,更新到数据库上下文
            conversationDomainService.saveMessagesToContext(List.of(assistMessage, userMessage1), context.getChatContext().getContextEntity());

            // 向前端发送补充信息
            context.sendEndMessage(requirement, MessageType.TEXT);

            // 等待用户补充数据
            CompletableFuture<String> waitForInput = new CompletableFuture<>();
            WAITING_FUTURE.put(sessionId, waitForInput);
            BLOCKING_CONTEXT.put(sessionId, context);

            return waitForInput.thenCompose(input -> {
                // 获取到用户输入，递归调用
                context.getChatContext().setUserMessage(input);
                return checkInfoComplete(context, retryTimes + 1);
            });
        } catch (Exception e) {
            logger.error("数据完整性验证失败");
            context.sendErrorMessage(e);

            WAITING_FUTURE.remove(sessionId);
            BLOCKING_CONTEXT.remove(sessionId);
            return CompletableFuture.completedFuture(false);
        }
    }

    /**
     * 获取标准客户端
     */
    public ChatModel getChatModel(AgentWorkflowContext<?> context) {
        return LlmProviderService.getChatModel(context.getChatContext().getProviderEntity().getProtocol(),
                context.getChatContext().getProviderEntity().getConfig());
    }


    public ChatRequest buildRequest(AgentWorkflowContext<?> context) {
        List<MessageEntity> history = context.getChatContext().getHistoryMessages();

        List<ChatMessage> messages = new ArrayList<>();
        for (MessageEntity message : history) {
            if (message.getRole() == Role.USER) {
                messages.add(new UserMessage(message.getContent()));
            } else if (message.getRole() == Role.SYSTEM) {
                messages.add(new SystemMessage(message.getContent()));
            } else {
                messages.add(new AiMessage(message.getContent()));
            }
        }
        return ChatRequest.builder()
                .messages(messages)
                .build();
    }


    /**
     * 创建用户消息
     */
    private MessageEntity createUserMessage(ChatContext environment) {
        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setRole(Role.USER);
        messageEntity.setContent(environment.getUserMessage());
        messageEntity.setSessionId(environment.getSessionId());
        return messageEntity;
    }

    /**
     * 创建助手消息
     */
    private MessageEntity createAssistMessage(ChatContext environment) {
        MessageEntity message = new MessageEntity();
        message.setProvider(environment.getProviderEntity().getId());
        message.setModel(environment.getModelEntity().getModelId());
        message.setRole(Role.ASSISTANT);
        message.setSessionId(environment.getSessionId());
        return message;
    }
}
