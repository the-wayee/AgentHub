package com.xiaoguai.agentx.domain.llm.model;


import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.xiaoguai.agentx.domain.llm.model.config.LlmModelConfig;
import com.xiaoguai.agentx.domain.llm.model.enums.ModelType;
import com.xiaoguai.agentx.infrastrcture.converter.LlmModelConfigConverter;
import com.xiaoguai.agentx.infrastrcture.converter.ModelTypeConverter;
import com.xiaoguai.agentx.infrastrcture.entity.BaseEntity;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import org.apache.ibatis.type.JdbcType;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 20:44
 * @Description: 模型领域模型
 */
@TableName("models")
public class ModelEntity extends BaseEntity {


    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    /**
     * 用户id
     */
    private String userId;
    /**
     * 供应商id
     */
    private String providerId;
    /**
     * 模型id
     */
    private String modelId;
    /**
     * 模型名称
     */
    private String name;
    /**
     * 描述
     */
    private String description;
    /**
     * 是否官方
     */
    private Boolean official;

    @TableField(typeHandler = ModelTypeConverter.class, jdbcType = JdbcType.VARCHAR)
    private ModelType type;

    private Boolean status;

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

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Boolean getOfficial() {
        return official;
    }

    public void setOfficial(Boolean official) {
        this.official = official;
    }

    public void isActive() {
        if (Boolean.FALSE.equals(status)){
            throw new BusinessException("模型未激活");
        }
    }
}
