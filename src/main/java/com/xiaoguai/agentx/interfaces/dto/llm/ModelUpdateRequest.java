package com.xiaoguai.agentx.interfaces.dto.llm;


import com.xiaoguai.agentx.domain.llm.model.config.LLMModelConfig;
import jakarta.validation.constraints.NotBlank;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 11:05
 * @Description: 模型更新请求
 */
public class ModelUpdateRequest {

    /**
     * 模型ID
     */
    private String id;

    /**
     * 模型id
     */
    @NotBlank(message = "模型id不可为空")
    private String modelId;

    /**
     * 模型名称
     */
    @NotBlank(message = "名称不可为空")
    private String name;

    /**
     * 模型描述
     */
    private String description;

    public LLMModelConfig getConfig() {
        return config;
    }

    public void setConfig(LLMModelConfig config) {
        this.config = config;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getModelId() {
        return modelId;
    }

    public void setModelId(String modelId) {
        this.modelId = modelId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    /**
     * 模型配置
     */
    private LLMModelConfig config;
}
