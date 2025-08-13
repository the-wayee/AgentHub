package com.xiaoguai.agentx.infrastrcture.llm.factory;


import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.llm.config.BaseProviderConfig;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
import dev.langchain4j.community.model.dashscope.QwenStreamingChatModel;
import dev.langchain4j.community.model.zhipu.ZhipuAiStreamingChatModel;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 17:22
 * @Description: 返回不同Provider的StreamChatModel
 */
public class LlmProviderFactory {

    public static StreamingChatModel createChatModel(ProviderProtocol protocol, BaseProviderConfig config) {
        StreamingChatModel model = null;
        switch (protocol) {
            case OPENAI -> {
                model = OpenAiStreamingChatModel.builder()
                        .baseUrl(config.getBaseUrl())
                        .modelName(config.getModel())
                        .apiKey(config.getApiKey())
                        .build();
            }
            case DASHSCOPE -> {
                model = QwenStreamingChatModel.builder()
                        .modelName(config.getModel())
                        .apiKey(config.getApiKey())
                        .build();
            }
            case ZHIPU -> {
                model = ZhipuAiStreamingChatModel.builder()
                        .model(config.getModel())
                        .apiKey(config.getApiKey())
                        .build();
            }
            default -> {
                throw new BusinessException("获取服务商协议失败: " + protocol.getName());
            }
        }
        return model;
    }
}
