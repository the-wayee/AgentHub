package com.xiaoguai.agentx.domain.agent.model;


import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.xiaoguai.agentx.domain.llm.model.config.LlmModelConfig;
import com.xiaoguai.agentx.infrastrcture.converter.LlmModelConfigConverter;
import com.xiaoguai.agentx.infrastrcture.entity.BaseEntity;

import java.time.LocalDateTime;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-02 15:42
 * @Description: Agent工作区实体类
 */
@TableName("agent_workspace")
public class AgentWorkspaceEntity extends BaseEntity {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_UUID)
    private String id;

    /**
     * Agent ID
     */
    @TableField("agent_id")
    private String agentId;

    /**
     * 用户ID
     */
    @TableField("user_id")
    private String userId;

    /**
     * 模型id
     */
    @TableField(value = "llm_model_config", typeHandler = LlmModelConfigConverter.class)
    private LlmModelConfig llmModelConfig;

    /**
     * 默认构造函数
     */
    public AgentWorkspaceEntity() {

    }

    /**
     * 带参数的构造函数
     *
     * @param agentId   Agent ID
     * @param userId    用户ID
     * @param llmModelConfig 模型配置
     */
    public AgentWorkspaceEntity(String agentId, String userId, LlmModelConfig llmModelConfig) {
        this.agentId = agentId;
        this.userId = userId;
        this.llmModelConfig = llmModelConfig;
    }

    // Getter 和 Setter 方法

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAgentId() {
        return agentId;
    }

    public void setAgentId(String agentId) {
        this.agentId = agentId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public LlmModelConfig getLlmModelConfig() {
        if (llmModelConfig == null) {
            llmModelConfig = new LlmModelConfig();
        }
        return llmModelConfig;
    }

    public void setLlmModelConfig(LlmModelConfig llmModelConfig) {
        this.llmModelConfig = llmModelConfig;
    }
}
