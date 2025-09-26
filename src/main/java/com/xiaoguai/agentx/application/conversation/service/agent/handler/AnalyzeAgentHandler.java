package com.xiaoguai.agentx.application.conversation.service.agent.handler;


import com.alibaba.fastjson2.JSON;
import com.xiaoguai.agentx.application.conversation.service.ChatContext;
import com.xiaoguai.agentx.application.conversation.service.agent.dto.AnalyzerMessageDTO;
import com.xiaoguai.agentx.application.conversation.service.agent.event.AgentEvent;
import com.xiaoguai.agentx.application.conversation.service.agent.manager.ContextFillManager;
import com.xiaoguai.agentx.application.conversation.service.agent.template.AgentPromptTemplates;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowContext;
import com.xiaoguai.agentx.application.conversation.service.agent.workflow.AgentWorkflowStatus;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 分析问题处理器
 */
@Component
public class AnalyzeAgentHandler extends AbstractAgentHandler {

    private static final String extraAnalyzerMessageKey = "analyzerMessage";

    protected AnalyzeAgentHandler(ConversationDomainService conversationDomainService) {
        super(conversationDomainService);
    }


    @Override
    public <T> boolean shouldHandle(AgentEvent<T> context) {
        return context.getToStatus() == AgentWorkflowStatus.ANALYZE;
    }

    @Override
    public <T> void processEvent(AgentWorkflowContext<T> context) {
        MessageEntity userMessage = context.getUserMessage();

        // 获取标准大模型
        ChatModel chatModel = getChatModel(context);

        // 构建请求
        ChatRequest chatRequest = buildRequest(context.getChatContext());
        List<ChatMessage> messages = new ArrayList<>(chatRequest.messages());
        messages.add(new SystemMessage(AgentPromptTemplates.getAnalyserMessagePrompt(userMessage.getContent())));
        chatRequest = chatRequest.toBuilder().messages(messages).build();
        // 请求大模型，询问是否简单问题
        String result = chatModel.chat(chatRequest).aiMessage().text();
        AnalyzerMessageDTO analyzerMessageDTO = JSON.parseObject(result, AnalyzerMessageDTO.class);
        context.addExtraData(extraAnalyzerMessageKey, analyzerMessageDTO);
        // 是简单问答问题
        if (analyzerMessageDTO.isQuestion()) {
            // 向前端返回流式响应
            context.sendStreamMessage(analyzerMessageDTO.getReply(), MessageType.TEXT);
            // 保存消息
            context.getAssistMessage().setContent(analyzerMessageDTO.getReply());
            saveAndUpdateContext(List.of(context.getUserMessage(), context.getAssistMessage()), context.getChatContext());
        }
    }

    @Override
    public <T> void transitionTo(AgentWorkflowContext<T> context) {
        AnalyzerMessageDTO dto = (AnalyzerMessageDTO) context.getExtraData().get(extraAnalyzerMessageKey);
        if (dto.isQuestion()) {
            context.setBreak(true);
        } else {
            context.transitionTo(AgentWorkflowStatus.TASK_SPLIT);
        }
    }


    /**
     * 构建请求
     */
    private ChatRequest buildRequest(ChatContext context) {
        return context.prepareRequest();
    }

}
