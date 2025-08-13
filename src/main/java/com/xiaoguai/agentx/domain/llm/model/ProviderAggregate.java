package com.xiaoguai.agentx.domain.llm.model;


import com.xiaoguai.agentx.infrastrcture.llm.config.ProviderConfig;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 20:47
 * @Description: 服务提供商聚合根
 */
public class ProviderAggregate {

    private ProviderEntity provider;
    private List<ModelEntity> models = new ArrayList<>();


    public ProviderAggregate(ProviderEntity provider, List<ModelEntity> models) {
        this.provider = provider;
        this.models = models;
    }

    public void addModel(ModelEntity model) {
        if (model != null && model.getProviderId().equals(provider.getId())) {
            models.add(model);
        }
    }

    public List<ModelEntity> getModels() {
        return models;
    }

    public void setModels(List<ModelEntity> models) {
        this.models = models;
    }

    /**
     * 获取服务商配置（解密版本）
     */
    public ProviderConfig getConfig() {
        return provider.getConfig();  // 已解密
    }

    /**
     * 设置服务商配置（会自动加密）
     */
    public void setConfig(ProviderConfig config) {
        provider.setConfig(config);  // 会自动加密
    }

    public String getId() {
        return provider.getId();
    }

    public String getUserId() {
        return provider.getUserId();
    }

    public ProviderProtocol getProtocol() {
        return provider.getProtocol();
    }

    public void setProtocol(ProviderProtocol code) {
        provider.setProtocol(code);
    }

    public String getName() {
        return provider.getName();
    }

    public void setName(String name) {
        provider.setName(name);
    }

    public String getDescription() {
        return provider.getDescription();
    }

    public void setDescription(String description) {
        provider.setDescription(description);
    }

    public Boolean getOfficial() {
        return provider.getOfficial();
    }

    public void setOfficial(Boolean official) {
        provider.setOfficial(official);
    }

    public Boolean getStatus() {
        return provider.getStatus();
    }

    public void setStatus(Boolean status) {
        provider.setStatus(status);
    }

    public LocalDateTime getCreatedAt() {
        return provider.getCreatedAt();
    }

    public LocalDateTime getUpdatedAt() {
        return provider.getUpdatedAt();
    }

    public LocalDateTime getDeletedAt() {
        return provider.getDeletedAt();
    }

    public ProviderEntity getProvider() {
        return provider;
    }

    public void setProvider(ProviderEntity provider) {
        this.provider = provider;
    }
}
