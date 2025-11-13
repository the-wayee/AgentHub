package com.xiaoguai.agentx.infrastrcture.config;


import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Embedding provider configuration dedicated to knowledge ingestion.
 */
@Configuration
@ConfigurationProperties(prefix = "knowledge.embedding")
public class KnowledgeEmbeddingProperties {

    /**
     * Provider protocol, default OPENAI compatible.
     */
    private ProviderProtocol protocol = ProviderProtocol.OPENAI;

    /**
     * Base URL of the embedding endpoint.
     */
    private String baseUrl;

    /**
     * API key used to access the embedding endpoint.
     */
    private String apiKey;

    /**
     * Embedding model identifier.
     */
    private String model;

    /**
     * Batch size when calling embedAll.
     */
    private int batchSize = 8;

    public ProviderProtocol getProtocol() {
        return protocol;
    }

    public void setProtocol(ProviderProtocol protocol) {
        this.protocol = protocol;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public int getBatchSize() {
        return batchSize;
    }

    public void setBatchSize(int batchSize) {
        this.batchSize = batchSize;
    }
}
