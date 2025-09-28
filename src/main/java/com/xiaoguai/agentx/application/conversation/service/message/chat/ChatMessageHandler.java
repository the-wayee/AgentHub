package com.xiaoguai.agentx.application.conversation.service.message.chat;


import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.xiaoguai.agentx.application.conversation.dto.AgentChatResponse;
import com.xiaoguai.agentx.application.conversation.service.AbstractMessageHandler;
import com.xiaoguai.agentx.application.conversation.service.context.ChatContext;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import com.xiaoguai.agentx.domain.conversation.constants.Role;
import com.xiaoguai.agentx.domain.conversation.factory.MessageFactory;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.infrastrcture.llm.LlmProviderService;
import com.xiaoguai.agentx.infrastrcture.llm.factory.LlmRequestParameterFactory;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.request.ChatRequestParameters;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.PartialThinking;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.model.output.TokenUsage;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 10:31
 * @Description: 聊天类型消息处理
 */
@Component
public class ChatMessageHandler extends AbstractMessageHandler {

    protected ChatMessageHandler(ConversationDomainService conversationDomainService, ContextDomainService contextDomainService) {
        super(conversationDomainService, contextDomainService);
    }

}
