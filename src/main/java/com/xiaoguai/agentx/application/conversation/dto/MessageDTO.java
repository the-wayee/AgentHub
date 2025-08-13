package com.xiaoguai.agentx.application.conversation.dto;

import com.xiaoguai.agentx.domain.conversation.contants.Role;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;

import java.time.LocalDateTime;

/**
 * 消息DTO，用于API响应
 */
public class MessageDTO {
    private String id;
    private Role role;
    private String content;
    private LocalDateTime createdAt;
    private String provider;
    private String model;

    /**
     * 无参构造函数
     */
    public MessageDTO() {
    }

    // Getter和Setter方法
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
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
}