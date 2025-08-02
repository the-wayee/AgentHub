package com.xiaoguai.agentx.domain.conversation.dto;

import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;

import java.time.LocalDateTime;

/**
 * 消息DTO，用于API响应
 */
public class MessageDTO {
    private String id;
    private String role;
    private String content;
    private LocalDateTime createdAt;
    private String provider;
    private String model;

    /**
     * 无参构造函数
     */
    public MessageDTO() {
    }

    /**
     * 全参构造函数
     */
    public MessageDTO(String id, String role, String content, LocalDateTime createdAt,
                      String provider, String model) {
        this.id = id;
        this.role = role;
        this.content = content;
        this.createdAt = createdAt;
        this.provider = provider;
        this.model = model;
    }

    // Getter和Setter方法
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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

    /**
     * 将消息实体转换为DTO
     */
    public static MessageDTO fromEntity(MessageEntity messageEntity) {
        MessageDTO dto = new MessageDTO();
        dto.setId(messageEntity.getId());
        dto.setRole(messageEntity.getRole());
        dto.setContent(messageEntity.getContent());
        dto.setCreatedAt(messageEntity.getCreatedAt());
        dto.setProvider(messageEntity.getProvider());
        dto.setModel(messageEntity.getModel());
        return dto;
    }
}