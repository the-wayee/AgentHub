package com.xiaoguai.agentx.application.llm.dto;


import com.xiaoguai.agentx.domain.llm.model.config.LlmModelConfig;
import com.xiaoguai.agentx.domain.llm.model.enums.ModelType;

import java.time.LocalDateTime;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 10:50
 * @Description: 模型DTO
 */
public class ModelDTO {

    /**
     * 模型id
     */
    private String id;
    /**
     * 用户id
     */
    private String userId;
    /**
     * 服务商id
     */
    private String providerId;
    /**
     * 服务商名称
     */
    private String providerName; // 额外添加，便于前端显示
    /**
     * 模型id
     */
    private String modelId;
    /**
     * 模型名称
     */
    private String name;
    /**
     * 模型描述
     */
    private String description;
    /**
     * 模型类型
     */
    private ModelType type;
    /**
     * 模型配置
     */
    private LlmModelConfig config;
    /**
     * 是否官方
     */
    private Boolean official;
    /**
     * 模型状态
     */
    private Boolean status;
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

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

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getModelId() {
        return modelId;
    }

    public void setModelId(String modelId) {
        this.modelId = modelId;
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

    public ModelType getType() {
        return type;
    }

    public void setType(ModelType type) {
        this.type = type;
    }

    public LlmModelConfig getConfig() {
        return config;
    }

    public void setConfig(LlmModelConfig config) {
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
