package com.xiaoguai.agentx.domain.llm.model.config;


import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 20:34
 * @Description: 服务商配置
 */
public class ProviderConfig {
    /**
     * ApiKey
     */
    private String apiKey;
    /**
     * BaseUrl
     */
    private String baseUrl;

    /**
     * 供应商类型
     */
    private ProviderProtocol protocol;

    /**
     * 模型Id
     */
    private String model;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public ProviderProtocol getProtocol() {
        return protocol;
    }

    public void setProtocol(ProviderProtocol protocol) {
        this.protocol = protocol;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}
