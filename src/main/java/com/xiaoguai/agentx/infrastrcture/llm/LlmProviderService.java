package com.xiaoguai.agentx.infrastrcture.llm;


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
     * @param protocol 服务商协议
     * @param config 服务商配置
     */
    public StreamingChatModel getStreamModel(ProviderProtocol protocol, BaseProviderConfig config) {
        return LlmProviderFactory.createChatModel(protocol, config);
    }
}
