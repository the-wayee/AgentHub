package com.xiaoguai.agentx.interfaces.dto.llm;


import com.xiaoguai.agentx.domain.llm.model.config.ProviderConfig;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 11:47
 * @Description: 提供商更新请求
 */
public class ProviderUpdateRequest {

    /**
     * 服务商id
     */
    private String id;

    /**
     * 提供商协议
     */
    @NotNull(message = "协议不能为空")
    private ProviderProtocol protocol;
    /**
     * 提供商名称
     */
    @NotBlank(message = "名称不能为空")
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
     * 状态
     */
    private Boolean status;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }
}
