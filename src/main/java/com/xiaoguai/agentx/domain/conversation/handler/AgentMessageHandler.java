package com.xiaoguai.agentx.domain.conversation.handler;


import com.xiaoguai.agentx.domain.conversation.factory.MessageFactory;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.service.ContextDomainService;
import com.xiaoguai.agentx.domain.conversation.service.ConversationDomainService;
import com.xiaoguai.agentx.domain.task.service.TaskDomainService;
import com.xiaoguai.agentx.infrastrcture.llm.LlmProviderService;
import com.xiaoguai.agentx.infrastrcture.transport.MessageTransport;
import dev.langchain4j.model.chat.StreamingChatModel;
import org.springframework.stereotype.Component;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 14:48
 * @Description: Agent消息处理器
 */
@Component
public class AgentMessageHandler extends ChatMessageHandler {

    private final TaskDomainService taskDomainService;


    public AgentMessageHandler(ConversationDomainService conversationDomainService,
                               ContextDomainService contextDomainService, TaskDomainService taskDomainService) {
        super(conversationDomainService, contextDomainService);
        this.taskDomainService = taskDomainService;
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

    @Override
    public <T> T handleChat(ChatEnvironment environment, MessageTransport<T> transport) {

        return super.handleChat(environment, transport);
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
}
