package com.xiaoguai.agentx.application.conversation.service;


import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.xiaoguai.agentx.application.conversation.dto.AgentChatResponse;
import com.xiaoguai.agentx.application.conversation.service.context.AgentPromptTemplates;
import com.xiaoguai.agentx.application.conversation.service.context.ChatContext;
import com.xiaoguai.agentx.application.conversation.service.message.agent.ToolCallManager;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import com.xiaoguai.agentx.domain.conversation.constants.Role;
import com.xiaoguai.agentx.domain.conversation.factory.MessageFactory;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.domain.conversation.service.MessageDomainService;
import com.xiaoguai.agentx.infrastrcture.llm.LlmProviderService;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.output.TokenUsage;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.TokenStream;
import dev.langchain4j.service.tool.ToolProvider;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import dev.langchain4j.store.memory.chat.InMemoryChatMemoryStore;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-14 14:58
 * @Description: 模板消息处理
 */
public abstract class AbstractMessageHandler implements MessageHandler {

    /**
     * 默认连接超时时间：5min
     */
    protected static final long CONNECTION_TIMEOUT = 300000L;

    /**
     * 摘要前缀信息
     */
    private static final String SUMMARY_PREFIX = "以下是用户历史消息的摘要，请仅作为参考，用户没有提起则不要回答摘要中的内容：\\n";


    private final MessageDomainService messageDomainService;
    private final ConversationDomainService conversationDomainService;

    protected AbstractMessageHandler(MessageDomainService messageDomainService, ConversationDomainService conversationDomainService) {
        this.messageDomainService = messageDomainService;
        this.conversationDomainService = conversationDomainService;
    }


    /**
     * 交给子类实现
     *
     * @param environment 对话环境
     * @param transport   传输对象
     */
    @Override
    public <T> T handleChat(ChatContext environment, MessageTransport<T> transport) {
        // 创建连接
        T connection = transport.createConnection(CONNECTION_TIMEOUT);

        // 创建model
        StreamingChatModel streamModel = LlmProviderService.getStreamModel(environment.getProviderEntity().getProtocol(), environment.getProviderEntity().getConfig());

        // 创建对话消息
        MessageEntity userMessage = createUserMessage(environment);
        MessageEntity assistMessage = createAssistMessage(environment, MessageType.TEXT);

        conversationDomainService.saveMessagesToContext(List.of(userMessage), environment.getContextEntity());

        // 获取服务提供商
        ToolProvider toolProvider = provideTools();

        // 创建内存记忆上下文
        ChatMemory memory = initMemory();

        // 构建历史消息
        buildHistory(environment, memory);

        // 创建Agent service
        Agent agent = AiServices.builder(Agent.class)
                .streamingChatModel(streamModel)
                .toolProvider(toolProvider)
                .chatMemory(memory)
                .build();

        // 处理聊天请求
        processChat(agent, connection, transport, environment, userMessage, assistMessage);

        return connection;
    }

    /**
     * 提供工具调用，默认null
     * 具体可由子类实现
     */
    protected ToolProvider provideTools() {
        return null;
    }


    /**
     * 创建用户消息
     */
    protected MessageEntity createUserMessage(ChatContext chatContext) {
        return MessageFactory.createUserMessage(chatContext);
    }

    /**
     * 创建助理消息
     */
    protected MessageEntity createAssistMessage(ChatContext chatContext, MessageType messageType) {
        return MessageFactory.createAssistMessage(chatContext, messageType);
    }



    /**
     * 处理聊天请求
     */
    protected <T> void processChat(Agent agent, T connect,
                                   MessageTransport<T> transport, ChatContext environment,
                                   MessageEntity userMessage, MessageEntity assistMessage) {

        TokenStream tokenStream = agent.chat(userMessage.getContent());
        tokenStream.ignoreErrors();
        tokenStream.onPartialResponse(token -> {
            transport.sendMessage(connect, AgentChatResponse.buildMessage(token, MessageType.TEXT));
        });

        tokenStream.onCompleteResponse(response -> {
            TokenUsage tokenUsage = response.tokenUsage();
            assistMessage.setTokenCount(tokenUsage.outputTokenCount());
            assistMessage.setContent(response.aiMessage().text());

            userMessage.setTokenCount(tokenUsage.inputTokenCount());
            // 更新用户的token
            messageDomainService.updateMessage(userMessage);
            // 发送sse消息
            transport.sendEndMessage(connect, AgentChatResponse.buildEndMessage(MessageType.TEXT));

            // 保存信息
            conversationDomainService.saveMessagesToContext(List.of(assistMessage), environment.getContextEntity());
        });

        StringBuilder toolMessageBuilder = new StringBuilder();
        tokenStream.onToolExecuted(tool -> {
            String toolName = tool.request().name();
            toolMessageBuilder.append("执行工具: ").append(toolName).append("\n")
                    .append("结果: ").append(tool.result());
            MessageEntity toolMessage = createAssistMessage(environment, MessageType.TOOL_CALL);
            toolMessage.setContent(toolMessageBuilder.toString());
            transport.sendMessage(connect, AgentChatResponse.buildMessage(toolMessageBuilder.toString(), MessageType.TOOL_CALL));
            conversationDomainService.saveMessagesToContext(List.of(toolMessage), environment.getContextEntity());
        });

        tokenStream.start();
    }


    /**
     * 初始化内存记忆
     */
    private ChatMemory initMemory() {
        return MessageWindowChatMemory.builder()
                .maxMessages(100)
                .chatMemoryStore(new InMemoryChatMemoryStore())
                .build();
    }

    /**
     * 构建历史消息
     */
    private void buildHistory(ChatContext context, ChatMemory memory) {
        String summary = context.getContextEntity().getSummary();
        if (StringUtils.isNotBlank(summary)) {
            memory.add(new AiMessage(summary));
        }
        memory.add(new SystemMessage(context.getAgentEntity().getSystemPrompt()));
        for (MessageEntity message : context.getHistoryMessages()) {
            if (message.isUserMessage()) {
                memory.add(new UserMessage(message.getContent()));
            } else if (message.isAssistMessage()) {
                memory.add(new AiMessage(message.getContent()));
            } else if (message.isSystemMessage()) {
                memory.add(new SystemMessage(message.getContent()));
            }
        }
    }


}
