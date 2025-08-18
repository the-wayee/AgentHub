package com.xiaoguai.agentx.infrastrcture.llm;


import com.xiaoguai.agentx.domain.llm.model.ModelEntity;
import com.xiaoguai.agentx.domain.llm.model.ProviderEntity;
import com.xiaoguai.agentx.infrastrcture.llm.config.BaseProviderConfig;
import com.xiaoguai.agentx.infrastrcture.llm.factory.LlmProviderFactory;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
import dev.langchain4j.model.chat.StreamingChatModel;
import org.springframework.stereotype.Service;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 17:18
 * @Description: LLM服务商服务
 */
@Service
public class LlmProviderService {

    /**
     * 获取流式输出模型
     * @param provider 服务商
     * @param model 模型
     */
    public StreamingChatModel getStreamModel(ProviderEntity provider, ModelEntity model) {

        BaseProviderConfig config = new BaseProviderConfig();
        config.setApiKey(provider.getConfig().getApiKey());
        config.setBaseUrl(provider.getConfig().getBaseUrl());
        config.setModel(model.getModelId());

        return LlmProviderFactory.createChatModel(provider.getProtocol(), config);
    }
}
