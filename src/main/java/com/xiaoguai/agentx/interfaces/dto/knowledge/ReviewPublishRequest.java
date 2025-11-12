package com.xiaoguai.agentx.interfaces.dto.knowledge;

import jakarta.validation.constraints.NotBlank;

public class ReviewPublishRequest {
    @NotBlank
    private String recordId;
    private boolean approve;
    private String rejectReason;

    public String getRecordId() { return recordId; }
    public void setRecordId(String recordId) { this.recordId = recordId; }
    public boolean isApprove() { return approve; }
    public void setApprove(boolean approve) { this.approve = approve; }
    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }
}

