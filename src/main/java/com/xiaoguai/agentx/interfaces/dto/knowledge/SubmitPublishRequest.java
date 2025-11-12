package com.xiaoguai.agentx.interfaces.dto.knowledge;

import jakarta.validation.constraints.NotBlank;

public class SubmitPublishRequest {
    @NotBlank
    private String knowledgeBaseId;
    private String versionNumber;
    private String changeLog;

    public String getKnowledgeBaseId() { return knowledgeBaseId; }
    public void setKnowledgeBaseId(String knowledgeBaseId) { this.knowledgeBaseId = knowledgeBaseId; }
    public String getVersionNumber() { return versionNumber; }
    public void setVersionNumber(String versionNumber) { this.versionNumber = versionNumber; }
    public String getChangeLog() { return changeLog; }
    public void setChangeLog(String changeLog) { this.changeLog = changeLog; }
}

