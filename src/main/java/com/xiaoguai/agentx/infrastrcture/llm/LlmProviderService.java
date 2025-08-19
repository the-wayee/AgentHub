package com.xiaoguai.agentx.infrastrcture.llm;


import com.xiaoguai.agentx.domain.llm.model.config.ProviderConfig;
import com.xiaoguai.agentx.infrastrcture.llm.config.BaseProviderConfig;
import com.xiaoguai.agentx.infrastrcture.llm.factory.LlmProviderFactory;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.StreamingChatModel;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 17:18
 * @Description: LLM服务商服务
 */
public class LlmProviderService {


    /**
     * 获取普通聊天模型
     * @param protocol 服务商协议
     * @param providerConfig 服务商配置
     */
    public static ChatModel getChatModel(ProviderProtocol protocol, ProviderConfig providerConfig) {
        BaseProviderConfig config = new BaseProviderConfig();
        config.setApiKey(providerConfig.getApiKey());
        config.setBaseUrl(providerConfig.getBaseUrl());
        config.setModel(providerConfig.getModel());

        return LlmProviderFactory.createChatModel(protocol, config);
    }

    /**
     * 获取流式输出模型
     * @param protocol 服务商协议
     * @param providerConfig 服务商配置
     */
    public static StreamingChatModel getStreamModel(ProviderProtocol protocol, ProviderConfig providerConfig) {
        BaseProviderConfig config = new BaseProviderConfig();
        config.setApiKey(providerConfig.getApiKey());
        config.setBaseUrl(providerConfig.getBaseUrl());
        config.setModel(providerConfig.getModel());

        return LlmProviderFactory.createStreamChatModel(protocol, config);
    }
}
