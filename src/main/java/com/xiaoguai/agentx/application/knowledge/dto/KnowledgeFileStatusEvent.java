package com.xiaoguai.agentx.application.knowledge.dto;


import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgeFileStatus;

import java.time.LocalDateTime;

/**
 * Payload pushed to the front-end via SSE to reflect processing progress.
 */
public class KnowledgeFileStatusEvent {

    private String fileId;
    private KnowledgeFileStatus status;
    private int progress;
    private String message;
    private LocalDateTime timestamp;

    public String getFileId() {
        return fileId;
    }

    public void setFileId(String fileId) {
        this.fileId = fileId;
    }

    public KnowledgeFileStatus getStatus() {
        return status;
    }

    public void setStatus(KnowledgeFileStatus status) {
        this.status = status;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
