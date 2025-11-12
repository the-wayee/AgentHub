package com.xiaoguai.agentx.domain.knowledge.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgeBaseStatus;
import com.xiaoguai.agentx.domain.knowledge.constants.Visibility;
import com.xiaoguai.agentx.infrastrcture.converter.KnowledgeBaseStatusConverter;
import com.xiaoguai.agentx.infrastrcture.converter.KnowledgeVisibilityConverter;
import com.xiaoguai.agentx.infrastrcture.entity.BaseEntity;

import java.time.LocalDateTime;

@TableName(value = "knowledge_base", autoResultMap = true)
public class KnowledgeBaseEntity extends BaseEntity {

    @TableId(value = "id", type = IdType.ASSIGN_UUID)
    private String id;

    @TableField("user_id")
    private String userId;

    @TableField("name")
    private String name;

    @TableField("description")
    private String description;

    @TableField(value = "visibility", typeHandler = KnowledgeVisibilityConverter.class)
    private Visibility visibility = Visibility.PRIVATE;

    @TableField(value = "status", typeHandler = KnowledgeBaseStatusConverter.class)
    private KnowledgeBaseStatus status = KnowledgeBaseStatus.DRAFT;

    /**
     * 发布版本id
     */
    @TableField("publish_record_id")
    private String publishRecordId;

    @TableField("published_at")
    private LocalDateTime publishedAt;

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
}

