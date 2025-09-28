package com.xiaoguai.agentx.infrastrcture.llm.factory;


import com.xiaoguai.agentx.domain.llm.model.config.LlmModelConfig;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
import dev.langchain4j.model.chat.request.ChatRequestParameters;
import dev.langchain4j.model.openai.OpenAiChatRequestParameters;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 11:22
 * @Description: 模型参数工厂，不同厂商参数不同
 */
public class LlmRequestParameterFactory {

    public static ChatRequestParameters getRequestParameter(ProviderProtocol providerProtocol, LlmModelConfig llmModelConfig) {
        ChatRequestParameters requestParameters;
        switch (providerProtocol) {
            case OPENAI -> {
                requestParameters = OpenAiChatRequestParameters.builder()
                        .temperature(llmModelConfig.getTemperature())
                        .topK(llmModelConfig.getTopK())
                        .topK(llmModelConfig.getTopK())
                        .build();
            }

            default -> {
                requestParameters = OpenAiChatRequestParameters.builder()
                        .modelName(llmModelConfig.getModelId())
                        .temperature(llmModelConfig.getTemperature())
                        .topK(llmModelConfig.getTopK())
                        .topK(llmModelConfig.getTopK())
                        .build();
            }
        }
        return requestParameters;
    }
}
