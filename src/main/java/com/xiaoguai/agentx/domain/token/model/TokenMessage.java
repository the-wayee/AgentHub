package com.xiaoguai.agentx.domain.token.model;


import java.time.LocalDateTime;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-11 15:14
 * @Description: Token领域的消息模型
 */
public class TokenMessage {

    /**
     * 消息Id
     */
    private String id;

    /**
     * 消息内容
     */
    private String content;

    /**
     * 角色
     */
    private String role;

    /**
     * Token数量
     */
    private Integer tokenCount;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    public TokenMessage() {
    }

    public TokenMessage(String id, String content, String role, Integer tokenCount) {
        this.id = id;
        this.content = content;
        this.role = role;
        this.tokenCount = tokenCount;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getTokenCount() {
        return tokenCount;
    }

    public void setTokenCount(Integer tokenCount) {
        this.tokenCount = tokenCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
