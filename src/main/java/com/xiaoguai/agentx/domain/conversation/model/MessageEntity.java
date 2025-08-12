package com.xiaoguai.agentx.domain.conversation.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import com.xiaoguai.agentx.domain.conversation.dto.MessageDTO;
import com.xiaoguai.agentx.infrastrcture.entity.BaseEntity;

import java.time.LocalDateTime;

/**
 * 消息实体类，代表对话中的一条消息
 */
@TableName("messages")
public class MessageEntity extends BaseEntity {

    /**
     * 消息唯一ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_UUID)
    private String id;

    /**
     * 所属会话ID
     */
    @TableField("session_id")
    private String sessionId;

    /**
     * 消息角色 (user, assistant, system)
     */
    @TableField("role")
    private String role;

    /**
     * 消息内容
     */
    @TableField("content")
    private String content;

    /**
     * Token数量
     */
    @TableField("token_count")
    private Integer tokenCount;

    /**
     * 服务提供商
     */
    @TableField("provider")
    private String provider;

    /**
     * 使用的模型
     */
    @TableField("model")
    private String model;

    /**
     * 消息元数据
     */
    @TableField("metadata")
    private String metadata;

    /**
     * 无参构造函数
     */
    public MessageEntity() {
    }

    /**
     * 全参构造函数
     */
    public MessageEntity(String id, String sessionId, String role, String content,
                         LocalDateTime createdAt, Integer tokenCount, String provider,
                         String model, String metadata) {
        this.id = id;
        this.sessionId = sessionId;
        this.role = role;
        this.content = content;
        this.createdAt = createdAt;
        this.tokenCount = tokenCount;
        this.provider = provider;
        this.model = model;
        this.metadata = metadata;
    }

    // Getter和Setter方法
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getTokenCount() {
        return tokenCount;
    }

    public void setTokenCount(Integer tokenCount) {
        this.tokenCount = tokenCount;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    /**
     * 创建用户消息
     */
    public static MessageEntity createUserMessage(String sessionId, String content) {
        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setSessionId(sessionId);
        messageEntity.setRole("user");
        messageEntity.setContent(content);
        messageEntity.setCreatedAt(LocalDateTime.now());
        return messageEntity;
    }

    /**
     * 创建系统消息
     */
    public static MessageEntity createSystemMessage(String sessionId, String content) {
        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setSessionId(sessionId);
        messageEntity.setRole("system");
        messageEntity.setContent(content);
        messageEntity.setCreatedAt(LocalDateTime.now());
        return messageEntity;
    }

    /**
     * 创建助手消息
     */
    public static MessageEntity createAssistantMessage(String sessionId, String content,
                                                       String provider, String model, Integer tokenCount) {
        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setSessionId(sessionId);
        messageEntity.setRole("assistant");
        messageEntity.setContent(content);
        messageEntity.setCreatedAt(LocalDateTime.now());
        messageEntity.setProvider(provider);
        messageEntity.setModel(model);
        messageEntity.setTokenCount(tokenCount);
        return messageEntity;
    }

    /**
     * 转换为API响应格式
     */
    public MessageDTO toDTO() {
        MessageDTO dto = new MessageDTO();
        dto.setId(this.id);
        dto.setRole(this.role);
        dto.setContent(this.content);
        dto.setCreatedAt(this.createdAt);
        return dto;
    }
}