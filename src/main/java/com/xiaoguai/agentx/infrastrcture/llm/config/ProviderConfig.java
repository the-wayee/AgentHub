package com.xiaoguai.agentx.infrastrcture.llm.config;


import java.util.HashMap;
import java.util.Map;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 17:19
 * @Description: 供应商配置
 */
public class ProviderConfig {

    /**
     * apiKey: sk-xxxx
     */
    private String apiKey;

    /**
     * 基础url, 例如 https://dashscope.aliyuncs.com/compatible-mode/v1
     */
    private String baseUrl;

    /**
     * 模型名称
     */
    private String model;

    /**
     * 自定义请求头
     */
    private final Map<String, String> customHeaders = new HashMap<>();

    public ProviderConfig() {
    }

    public ProviderConfig(String apiKey, String baseUrl, String model) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
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

    public void addCustomHeader(String name, String value) {
        customHeaders.put(name, value);
    }

    public Map<String, String> getCustomHeaders() {
        return customHeaders;
    }
}
