package com.xiaoguai.agentx.infrastrcture.config;


import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-24 11:54
 * @Description: 硅基流动配置
 */
@Configuration
@ConfigurationProperties(prefix = "llm.provider.providers.siliconflow")
public class SiliconFlowProperties {
    /**
     * providerName
     */
    private String name;
    /**
     * 模型名称
     */
    private String model;
    /**
     * baseUrl
     */
    private String apiUrl;
    /**
     * apiKey
     */
    private String apiKey;
    /**
     * timeout
     */
    private int timeout;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public int getTimeout() {
        return timeout;
    }

    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }
}
