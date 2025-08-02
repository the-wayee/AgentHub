package com.xiaoguai.agentx.domain.conversation.service;


import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.application.conversation.assembler.MessageAssembler;
import com.xiaoguai.agentx.application.conversation.dto.StreamChatRequest;
import com.xiaoguai.agentx.application.conversation.dto.StreamChatResponse;
import com.xiaoguai.agentx.domain.conversation.dto.MessageDTO;
import com.xiaoguai.agentx.domain.conversation.model.ContextEntity;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.repository.ContextRepository;
import com.xiaoguai.agentx.domain.conversation.repository.MessageRepository;
import com.xiaoguai.agentx.domain.llm.model.LlmRequest;
import com.xiaoguai.agentx.domain.llm.service.LlmService;
import com.xiaoguai.agentx.infrastrcture.llm.siliconflow.SiliconFlowLlmService;
import jakarta.annotation.Resource;
import org.apache.logging.log4j.util.TriConsumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-02 14:38
 * @Description: 对话服务实现
 */
@Service
public class ConversationDomainService {

    private final Logger logger = LoggerFactory.getLogger(ConversationDomainService.class);
    private final MessageRepository messageRepository;
    private final ContextRepository contextRepository;
    private final SessionDomainService sessionDomainService;

    @Resource
    private LlmService defaultLlmService;

    @Resource
    private Map<String, LlmService> llmServiceMap;


    public ConversationDomainService(MessageRepository messageRepository, ContextRepository contextRepository, SessionDomainService sessionDomainService) {
        this.messageRepository = messageRepository;
        this.contextRepository = contextRepository;
        this.sessionDomainService = sessionDomainService;
    }

    /**
     * 获取会话中的消息列表
     */
    public List<MessageDTO> getConversationMessages(String sessionId) {
        List<MessageEntity> messageEntities = messageRepository.selectList(Wrappers.<MessageEntity>lambdaQuery()
                .eq(MessageEntity::getSessionId, sessionId));
        return messageEntities.stream().map(MessageAssembler::toDTO).toList();
    }

    /**
     * 发送消息
     */
    public MessageEntity sendMessage(String sessionId, String userId, String content, String modelName) {
        logger.info("保存用户消息，会话ID: {}, 用户ID: {}", sessionId, userId);

        // 检查会话是否存在
        sessionDomainService.checkSessionExist(sessionId, userId);

        // 保存用户消息
        MessageEntity userMessage = MessageEntity.createUserMessage(sessionId, content);
        messageRepository.insert(userMessage);

        return userMessage;
    }

    /**
     * 保存助理回复消息 todo the-way 暂时这样写，后续不需要传其他信息，用其他表保存
     */
    public MessageEntity saveAssistantMessage(String sessionId, String content,
                                              String provider, String model, Integer tokenCount) {
        logger.info("保存助理回复消息，会话ID: {}", sessionId);

        // 创建并保存助理消息
        MessageEntity assistantMessage = MessageEntity.createAssistantMessage(
                sessionId, content, provider, model, tokenCount);
        messageRepository.insert(assistantMessage);
        return assistantMessage;
    }


    /**
     * 流式聊天处理
     */
    public void chatStream(StreamChatRequest request, TriConsumer<StreamChatResponse, Boolean, Boolean> responseHandler) {
        logger.info("===>接收到聊天请求{}", request.getMessage());

        // 获取LLM服务
        LlmService llmService = getLlmService(request.getProvider());

        // 组装LL请求
        LlmRequest llmRequest = new LlmRequest();
        llmRequest.addUserMessage(request.getMessage());
        llmRequest.setStream(true);

        if (request.getModel() != null && !request.getModel().isEmpty()) {
            logger.info("===>使用用户指定模型:{}", request.getModel());
            llmRequest.setModel(request.getModel());
        } else {
            logger.info("===>未指定模型，使用默认模型:{}", llmService.getDefaultModel());
            llmRequest.setModel(llmService.getDefaultModel());
        }

        if (llmService instanceof SiliconFlowLlmService siliconFlowLlmService) {
            logger.info("===>使用siliconFlow流式服务");
            siliconFlowLlmService.chatStream(llmRequest, (chunk, isLast, isReasoning) -> {
                StreamChatResponse response = new StreamChatResponse();
                response.setContent(chunk);
                response.setProvider(request.getProvider());
                response.setModel(request.getModel() == null ? siliconFlowLlmService.getDefaultModel() : request.getModel());
                response.setDone(isLast);
                response.setReasoning(isReasoning);

                responseHandler.accept(response, isLast, isReasoning);
            });
        } else {
            logger.info("服务商不支持真实流式");
            StreamChatResponse errorResponse = new StreamChatResponse();
            errorResponse.setDone(true);
            errorResponse.setProvider(llmService.getProviderName());
            errorResponse
                    .setModel(llmRequest.getModel() != null ? llmRequest.getModel() : llmService.getDefaultModel());
            errorResponse.setSessionId(request.getSessionId());

            // 调用响应处理回调，并标记为最后一个
            responseHandler.accept(errorResponse, true, false);
        }

    }

    /**
     * 删除会话下的消息
     *
     * @param sessionId 会话id
     */
    public void deleteConversationMessages(String sessionId) {
        messageRepository.delete(Wrappers.<MessageEntity>lambdaQuery().eq(MessageEntity::getSessionId, sessionId));
        contextRepository.delete(Wrappers.<ContextEntity>lambdaQuery().eq(ContextEntity::getSessionId, sessionId));
    }

    public void deleteConversationMessages(List<String> sessionIds) {
        messageRepository.delete(Wrappers.<MessageEntity>lambdaQuery().in(MessageEntity::getSessionId, sessionIds));
        contextRepository.delete(Wrappers.<ContextEntity>lambdaQuery().in(ContextEntity::getSessionId, sessionIds));
    }

    /**
     * 更新上下文，添加新消息到活跃消息列表
     */
    private void updateContext(String sessionId, String message) {
        // 查询会话是否存在
        ContextEntity contextEntity = contextRepository.selectOne(Wrappers.<ContextEntity>lambdaQuery()
                .eq(ContextEntity::getSessionId, sessionId));

        // 上下文不存在，创建上下文
        if (contextEntity == null) {
            ContextEntity context = ContextEntity.createNew(sessionId);
            context.addMessage(message);
            contextRepository.insert(context);
        } else {
            //更新上下文
            contextEntity.addMessage(message);
            contextRepository.updateById(contextEntity);
        }
    }

    private LlmService getLlmService(String provider) {
        // 根据供应商获取对应的LlmService实例
        if (provider == null || provider.isEmpty()) {
            logger.info("使用默认LLM服务: {}", defaultLlmService.getProviderName());
            return defaultLlmService;
        }

        logger.info("尝试获取 {} LLM服务", provider);
        LlmService service = llmServiceMap.get(provider);
        if (service == null) {
            logger.warn("未找到服务商 [{}] 的实现，使用默认服务商: {}", provider, defaultLlmService.getProviderName());
            return defaultLlmService;
        }

        logger.info("使用服务商: {}", service.getProviderName());
        return service;
    }
}


