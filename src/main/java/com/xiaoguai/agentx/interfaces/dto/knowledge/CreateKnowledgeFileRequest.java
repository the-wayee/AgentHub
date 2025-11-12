package com.xiaoguai.agentx.interfaces.dto.knowledge;

import jakarta.validation.constraints.NotBlank;

public class CreateKnowledgeFileRequest {
    @NotBlank
    private String knowledgeBaseId;
    @NotBlank
    private String fileName;
    @NotBlank
    private String filePath;
    private String fileType;
    private Long fileSize;

    public String getKnowledgeBaseId() { return knowledgeBaseId; }
    public void setKnowledgeBaseId(String knowledgeBaseId) { this.knowledgeBaseId = knowledgeBaseId; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
}

