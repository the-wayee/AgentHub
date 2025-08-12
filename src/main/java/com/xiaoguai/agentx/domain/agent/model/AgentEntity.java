package com.xiaoguai.agentx.domain.agent.model;


import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.xiaoguai.agentx.domain.agent.dto.AgentDTO;
import com.xiaoguai.agentx.domain.agent.constant.AgentType;
import com.xiaoguai.agentx.infrastrcture.converter.AgentModelConfigConverter;
import com.xiaoguai.agentx.infrastrcture.converter.ListConverter;
import com.xiaoguai.agentx.infrastrcture.entity.BaseEntity;
import com.xiaoguai.agentx.infrastrcture.typehandler.JsonTypeHandler;
import org.apache.ibatis.type.JdbcType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-28 16:16
 * @Description: AgentEntity
 */
@TableName(value = "agents", autoResultMap = true)
public class AgentEntity extends BaseEntity {


    /**
     * Agent唯一ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_UUID)
    private String id;

    /**
     * Agent名称
     */
    @TableField("name")
    private String name;

    /**
     * Agent头像URL
     */
    @TableField("avatar")
    private String avatar;

    /**
     * Agent描述
     */
    @TableField("description")
    private String description;

    /**
     * Agent系统提示词
     */
    @TableField("system_prompt")
    private String systemPrompt;

    /**
     * 欢迎消息
     */
    @TableField("welcome_message")
    private String welcomeMessage;

    /**
     * 模型配置，包含模型类型、温度等参数
     */
    @TableField(value = "model_config", typeHandler = AgentModelConfigConverter.class, jdbcType = JdbcType.OTHER)
    private AgentModelConfig agentModelConfig;

    /**
     * Agent可使用的工具列表
     */
    @TableField(value = "tools", typeHandler = ListConverter.class, jdbcType = JdbcType.OTHER)
    private List<AgentTool> tools;

    /**
     * 关联的知识库ID列表
     */
    @TableField(value = "knowledge_base_ids", typeHandler = ListConverter.class, jdbcType = JdbcType.OTHER)
    private List<String> knowledgeBaseIds;

    /**
     * 当前发布的版本ID
     */
    @TableField("published_version")
    private String publishedVersion;

    /**
     * Agent状态：1-启用，0-禁用
     */
    @TableField("enabled")
    private Boolean enabled;

    /**
     * Agent类型：1-聊天助手, 2-功能性Agent
     */
    @TableField("agent_type")
    private Integer agentType;

    /**
     * 创建者用户ID
     */
    @TableField("user_id")
    private String userId;

    public AgentEntity() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSystemPrompt() {
        return systemPrompt;
    }

    public void setSystemPrompt(String systemPrompt) {
        this.systemPrompt = systemPrompt;
    }

    public String getWelcomeMessage() {
        return welcomeMessage;
    }

    public void setWelcomeMessage(String welcomeMessage) {
        this.welcomeMessage = welcomeMessage;
    }

    public AgentModelConfig getModelConfig() {
        return agentModelConfig;
    }

    public void setModelConfig(AgentModelConfig agentModelConfig) {
        this.agentModelConfig = agentModelConfig;
    }

    public List<AgentTool> getTools() {
        return tools;
    }

    public void setTools(List<AgentTool> tools) {
        this.tools = tools;
    }

    public List<String> getKnowledgeBaseIds() {
        return knowledgeBaseIds;
    }

    public void setKnowledgeBaseIds(List<String> knowledgeBaseIds) {
        this.knowledgeBaseIds = knowledgeBaseIds;
    }

    public String getPublishedVersion() {
        return publishedVersion;
    }

    public void setPublishedVersion(String publishedVersion) {
        this.publishedVersion = publishedVersion;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Integer getAgentType() {
        return agentType;
    }

    public void setAgentType(Integer agentType) {
        this.agentType = agentType;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }



    public AgentEntity(String id, String name, String avatar, String description, String systemPrompt, String welcomeMessage, AgentModelConfig agentModelConfig, List<AgentTool> tools, List<String> knowledgeBaseIds, String publishedVersion, Boolean enabled, Integer agentType, String userId, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime deletedAt) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.description = description;
        this.systemPrompt = systemPrompt;
        this.welcomeMessage = welcomeMessage;
        this.agentModelConfig = agentModelConfig;
        this.tools = tools;
        this.knowledgeBaseIds = knowledgeBaseIds;
        this.publishedVersion = publishedVersion;
        this.enabled = enabled;
        this.agentType = agentType;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    /**
     * 更新Agent基本信息
     */
    public void updateBasicInfo(String name, String avatar, String description) {
        this.name = name;
        this.avatar = avatar;
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 更新Agent配置
     */
    public void updateConfig(String systemPrompt, String welcomeMessage, AgentModelConfig agentModelConfig,
                             List<AgentTool> tools, List<String> knowledgeBaseIds) {
        this.systemPrompt = systemPrompt;
        this.welcomeMessage = welcomeMessage;
        this.agentModelConfig = agentModelConfig;
        this.tools = tools;
        this.knowledgeBaseIds = knowledgeBaseIds;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 启用Agent
     */
    public void enable() {
        this.enabled = true;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 禁用Agent
     */
    public void disable() {
        this.enabled = false;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 发布新版本
     */
    public void publishVersion(String versionId) {
        this.publishedVersion = versionId;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 软删除
     */
    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }
    /**
     * 转换为DTO对象
     */
    public AgentDTO toDTO() {
        AgentDTO dto = new AgentDTO();
        dto.setId(this.id);
        dto.setName(this.name);
        dto.setAvatar(this.avatar);
        dto.setDescription(this.description);
        dto.setSystemPrompt(this.systemPrompt);
        dto.setWelcomeMessage(this.welcomeMessage);
        dto.setModelConfig(this.agentModelConfig);
        dto.setTools(this.tools);
        dto.setKnowledgeBaseIds(this.knowledgeBaseIds);
        dto.setPublishedVersion(this.publishedVersion);
        dto.setEnabled(this.enabled);
        dto.setAgentType(this.agentType);
        dto.setUserId(this.userId);
        dto.setCreatedAt(this.createdAt);
        dto.setUpdatedAt(this.updatedAt);
        return dto;
    }

    /**
     * 获取Agent类型枚举
     */
    public AgentType getAgentTypeEnum() {
        return AgentType.fromCode(this.agentType);
    }
}
