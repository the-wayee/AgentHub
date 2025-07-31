package com.xiaoguai.agentx.application.conversation.service;


import com.xiaoguai.agentx.application.conversation.dto.ChatRequest;
import com.xiaoguai.agentx.application.conversation.dto.ChatResponse;
import com.xiaoguai.agentx.application.conversation.dto.StreamChatRequest;
import com.xiaoguai.agentx.application.conversation.dto.StreamChatResponse;
import com.xiaoguai.agentx.domain.llm.model.LlmRequest;
import com.xiaoguai.agentx.domain.llm.model.LlmResponse;
import com.xiaoguai.agentx.domain.llm.service.LlmService;
import com.xiaoguai.agentx.infrastrcture.llm.siliconflow.SiliconFlowLlmService;
import jakarta.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.function.BiConsumer;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-24 13:18
 * @Description: 聊天服务
 */
@Service("conversationService1")
public class ConversationService {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Resource
    private LlmService defaultLlmService;
    @Resource
    private Map<String, LlmService> llmServiceMap;


    public ChatResponse chat(ChatRequest request) {
        logger.info("===>接收到请求消息:{}", request.getMessage());

        LlmService llmService = getLlmService(request.getProvider());

        LlmRequest llmRequest = new LlmRequest();
        llmRequest.addUserMessage(request.getMessage());
        if (request.getModel() != null && !request.getModel().isBlank()) {
            logger.info("===>用户使用模型:{}", request.getModel());
            llmRequest.setModel(request.getModel());
        } else {
            logger.info("===>使用默认模型:{}", llmService.getDefaultModel());
        }

        LlmResponse llmResponse = llmService.chat(llmRequest);

        ChatResponse chatResponse = new ChatResponse();
        chatResponse.setContent(llmResponse.getContent());
        chatResponse.setProvider(chatResponse.getProvider());
        chatResponse.setSessionId(request.getSessionId());
        chatResponse.setModel(llmResponse.getModel());
        return chatResponse;
    }

    public void chatStream(StreamChatRequest request, BiConsumer<StreamChatResponse, Boolean> consumer) {
        logger.info("===>接收到请求消息:{}", request.getMessage());

        LlmService llmService = getLlmService(request.getProvider());

        LlmRequest llmRequest = new LlmRequest();
        llmRequest.setStream(true);
        llmRequest.addUserMessage(request.getMessage());

        if (request.getModel() != null && !request.getModel().isBlank()) {
            logger.info("===>用户使用模型:{}", request.getModel());
            llmRequest.setModel(request.getModel());
        } else {
            logger.info("===>使用默认模型:{}", llmService.getDefaultModel());
        }

        if (llmService instanceof SiliconFlowLlmService siliconFlowLlmService) {
            logger.info("===>使用siliconFlow流式服务");

            siliconFlowLlmService.chatStream(llmRequest, (chunk, isLast, isReasoning) -> {
                StreamChatResponse response = new StreamChatResponse();
                response.setContent(chunk);
                response.setModel(llmRequest.getModel() == null ? siliconFlowLlmService.getDefaultModel() : llmRequest.getModel());
                response.setProvider(siliconFlowLlmService.getProvideeName());
                response.setDone(isLast);

                consumer.accept(response, isLast);
            });
        } else {
            logger.info("该服务不支持流式响应,使用传统分块");
        }
    }


    /**
     * 获取服务商对应的LLM服务
     */
    private LlmService getLlmService(String provider) {
        if (provider == null || provider.isBlank()) {
            logger.info("===>使用默认LLM服务:{}", defaultLlmService.getProvideeName());
            return defaultLlmService;
        }
        logger.info("===>尝试获取 {} LLM服务", provider);
        LlmService llmService = llmServiceMap.get(provider);
        if (llmService == null) {
            logger.error("===>获取 {} 服务失败,使用默认服务:{}", provider, defaultLlmService.getProvideeName());
            return defaultLlmService;
        }

        logger.info("===>使用 {} LLM服务", provider);
        return llmService;
    }
}
