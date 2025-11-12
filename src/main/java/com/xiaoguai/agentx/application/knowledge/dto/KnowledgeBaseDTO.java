package com.xiaoguai.agentx.application.knowledge.dto;

import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgeBaseStatus;
import com.xiaoguai.agentx.domain.knowledge.constants.Visibility;

import java.time.LocalDateTime;

public class KnowledgeBaseDTO {
    private String id;
    private String userId;
    private String name;
    private String description;
    private Visibility visibility;
    private KnowledgeBaseStatus status;
    private String publishRecordId;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Visibility getVisibility() { return visibility; }
    public void setVisibility(Visibility visibility) { this.visibility = visibility; }
    public KnowledgeBaseStatus getStatus() { return status; }
    public void setStatus(KnowledgeBaseStatus status) { this.status = status; }
    public String getPublishRecordId() { return publishRecordId; }
    public void setPublishRecordId(String publishRecordId) { this.publishRecordId = publishRecordId; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

