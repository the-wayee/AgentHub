package com.xiaoguai.agentx.application.llm.dto;


import com.xiaoguai.agentx.domain.llm.model.config.ProviderConfig;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;

import java.time.LocalDateTime;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 10:52
 * @Description: 提供商DTO
 */
public class ProviderDTO {

    private String id;
    /**
     * 用户id
     */
    private String userId;

    /**
     * 提供商协议
     */
    private ProviderProtocol protocol;
    /**
     * 提供商名称
     */
    private String name;
    /**
     * 描述
     */
    private String description;

    /**
     * 提供商配置：apiKey, baseUrl
     */
    private ProviderConfig config;

    /**
     * 是否官方配置
     */
    private Boolean official;

    /**
     * 状态: 启用/禁用
     */
    private Boolean status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    /**
     * 脱敏信息
     */
    public void maskSensitiveInfo() {
        if (config != null) {
            // 如果有API Key，则脱敏处理
            if (this.config.getApiKey() != null && !this.config.getApiKey().isEmpty()) {
                String apiKey = config.getApiKey();
                String prefix = apiKey.substring(0, 3);
                String suffix = apiKey.substring(apiKey.length() - 3);
                config.setApiKey(prefix + "******************" + suffix);
            }
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public ProviderProtocol getProtocol() {
        return protocol;
    }

    public void setProtocol(ProviderProtocol protocol) {
        this.protocol = protocol;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProviderConfig getConfig() {
        return config;
    }

    public void setConfig(ProviderConfig config) {
        this.config = config;
    }

    public Boolean getOfficial() {
        return official;
    }

    public void setOfficial(Boolean official) {
        this.official = official;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
