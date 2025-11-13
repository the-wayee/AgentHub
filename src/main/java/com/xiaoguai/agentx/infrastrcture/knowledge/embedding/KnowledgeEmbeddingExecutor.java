package com.xiaoguai.agentx.infrastrcture.knowledge.embedding;


import com.xiaoguai.agentx.infrastrcture.config.KnowledgeEmbeddingProperties;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.model.output.Response;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Centralizes embedding model creation and execution using LangChain4J.
 */
@Component
public class KnowledgeEmbeddingExecutor {

    private final EmbeddingModel embeddingModel;
    private final int batchSize;

    public KnowledgeEmbeddingExecutor(KnowledgeEmbeddingProperties embeddingProperties) {
        this.embeddingModel = buildModel(embeddingProperties);
        this.batchSize = Math.max(1, embeddingProperties.getBatchSize());
    }

    public List<Embedding> embedAll(List<TextSegment> segments) {
        List<Embedding> result = new ArrayList<>();
        for (int i = 0; i < segments.size(); i += batchSize) {
            List<TextSegment> batch = segments.subList(i, Math.min(i + batchSize, segments.size()));
            Response<List<Embedding>> response = embeddingModel.embedAll(batch);
            if (response == null || response.content() == null || response.content().isEmpty()) {
                throw new BusinessException("嵌入模型返回为空");
            }
            result.addAll(response.content());
        }
        return result;
    }

    private EmbeddingModel buildModel(KnowledgeEmbeddingProperties properties) {
        if (properties.getProtocol() != ProviderProtocol.OPENAI) {
            throw new BusinessException("暂不支持的嵌入模型协议: " + properties.getProtocol().name());
        }
        if (properties.getApiKey() == null || properties.getApiKey().isEmpty()) {
            throw new BusinessException("知识库嵌入模型未配置 API Key");
        }
        if (properties.getModel() == null || properties.getModel().isEmpty()) {
            throw new BusinessException("知识库嵌入模型未配置 model");
        }
        OpenAiEmbeddingModel.OpenAiEmbeddingModelBuilder builder = OpenAiEmbeddingModel.builder()
                .apiKey(properties.getApiKey())
                .modelName(properties.getModel());
        if (properties.getBaseUrl() != null && !properties.getBaseUrl().isEmpty()) {
            builder.baseUrl(properties.getBaseUrl());
        }
        return builder.build();
    }
}
