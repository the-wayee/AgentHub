package com.xiaoguai.agentx.domain.knowledge.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgePublishStatus;
import com.xiaoguai.agentx.infrastrcture.converter.KnowledgePublishStatusConverter;
import com.xiaoguai.agentx.infrastrcture.entity.BaseEntity;

import java.time.LocalDateTime;

@TableName(value = "knowledge_publish_record", autoResultMap = true)
public class KnowledgePublishRecordEntity extends BaseEntity {

    @TableId(value = "id", type = IdType.ASSIGN_UUID)
    private String id;

    @TableField("name")
    private String name;

    @TableField("description")
    private String description;

    @TableField("knowledge_base_id")
    private String knowledgeBaseId;

    @TableField("version_number")
    private String versionNumber;

    @TableField("submitter_id")
    private String submitterId;

    @TableField("reviewer_id")
    private String reviewerId;

    @TableField(value = "status", typeHandler = KnowledgePublishStatusConverter.class)
    private KnowledgePublishStatus status = KnowledgePublishStatus.REVIEWING;

    @TableField("reject_reason")
    private String rejectReason;

    @TableField("change_log")
    private String changeLog;

    @TableField("reviewed_at")
    private LocalDateTime reviewedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getKnowledgeBaseId() { return knowledgeBaseId; }
    public void setKnowledgeBaseId(String knowledgeBaseId) { this.knowledgeBaseId = knowledgeBaseId; }
    public String getVersionNumber() { return versionNumber; }
    public void setVersionNumber(String versionNumber) { this.versionNumber = versionNumber; }
    public String getSubmitterId() { return submitterId; }
    public void setSubmitterId(String submitterId) { this.submitterId = submitterId; }
    public String getReviewerId() { return reviewerId; }
    public void setReviewerId(String reviewerId) { this.reviewerId = reviewerId; }
    public KnowledgePublishStatus getStatus() { return status; }
    public void setStatus(KnowledgePublishStatus status) { this.status = status; }
    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }
    public String getChangeLog() { return changeLog; }
    public void setChangeLog(String changeLog) { this.changeLog = changeLog; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}

