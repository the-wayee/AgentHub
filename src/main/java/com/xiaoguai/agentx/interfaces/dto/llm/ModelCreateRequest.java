package com.xiaoguai.agentx.interfaces.dto.llm;


import com.xiaoguai.agentx.domain.llm.model.config.LLMModelConfig;
import com.xiaoguai.agentx.domain.llm.model.enums.ModelType;
import jakarta.validation.constraints.NotBlank;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 11:00
 * @Description: 模型创建请求
 */
public class ModelCreateRequest {

    /**
     * 服务商id
     */
    private String providerId;

    /**
     * 模型 Id
     */
    @NotBlank(message = "模型Id不能为空")
    private String modelId;

    /**
     * 模型名称
     */
    @NotBlank(message = "模型名称不可为空")
    private String name;

    /**
     * 模型描述
     */
    private String description;

    /**
     * 模型类型: 默认普通模型
     */
    private ModelType modelType = ModelType.NORMAL;

    /**
     * 模型配置
     */
    private LLMModelConfig modelConfig;

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
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

    public ModelType getModelType() {
        return modelType;
    }

    public void setModelType(ModelType modelType) {
        this.modelType = modelType;
    }

    public LLMModelConfig getModelConfig() {
        return modelConfig;
    }

    public void setModelConfig(LLMModelConfig modelConfig) {
        this.modelConfig = modelConfig;
    }
}
