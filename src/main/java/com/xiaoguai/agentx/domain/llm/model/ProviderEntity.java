package com.xiaoguai.agentx.domain.llm.model;


import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.xiaoguai.agentx.infrastrcture.converter.ProviderConfigConverter;
import com.xiaoguai.agentx.infrastrcture.converter.ProviderProtocolConverter;
import com.xiaoguai.agentx.infrastrcture.entity.BaseEntity;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.llm.config.ProviderConfig;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 20:45
 * @Description: 服务提供商领域模型
 */
@TableName("providers")
public class ProviderEntity extends BaseEntity {


    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    private String userId;

    @TableField(typeHandler = ProviderProtocolConverter.class)
    private ProviderProtocol protocol;
    private String name;
    private String description;

    @TableField(typeHandler = ProviderConfigConverter.class)
    private ProviderConfig config;

    private Boolean isOfficial;
    private Boolean status;

    public void setConfig(ProviderConfig config) {
        this.config = config;
    }

    public ProviderConfig getConfig() {
        return config;
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

    public Boolean getIsOfficial() {
        return isOfficial;
    }

    public void setIsOfficial(Boolean official) {
        isOfficial = official;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public void isActive() {
        if (!status){
            throw new BusinessException("服务商未激活");
        }
    }
}
