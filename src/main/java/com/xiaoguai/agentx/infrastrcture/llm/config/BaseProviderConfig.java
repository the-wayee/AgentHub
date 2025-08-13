package com.xiaoguai.agentx.infrastrcture.llm.config;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 17:19
 * @Description: 供应商配置
 */
public class BaseProviderConfig {

    /**
     * apiKey: sk-xxxx
     */
    private String apiKey;

    /**
     * 基础url, 例如 https://dashscope.aliyuncs.com/compatible-mode/v1
     */
    private String baseUrl;

    /**
     * 模型Id
     */
    private String model;
    public BaseProviderConfig() {
    }

    public BaseProviderConfig(String apiKey, String baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

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

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}
