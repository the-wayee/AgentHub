package com.xiaoguai.agentx.domain.conversation.handler;


import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.infrastrcture.llm.LlmProviderService;
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

    public AgentMessageHandler(ConversationDomainService conversationDomainService,
                               LlmProviderService llmProviderService,
                               ContextDomainService contextDomainService) {
        super(conversationDomainService, llmProviderService, contextDomainService);
    }

    @Override
    public <T> T handleChat(ChatEnvironment environment, MessageTransport<T> transport) {
        return super.handleChat(environment, transport);
    }


    /**
     * 预留工具调用
     * @param toolName 工具名称
     * @param parameters 参数
     */
    protected Object invokeTools(String toolName, Object parameters) {
        return null;
    }
}
