package com.xiaoguai.agentx.domain.knowledge.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgeFileStatus;
import com.xiaoguai.agentx.infrastrcture.converter.KnowledgeFileStatusConverter;
import com.xiaoguai.agentx.infrastrcture.entity.BaseEntity;

@TableName(value = "knowledge_file", autoResultMap = true)
public class KnowledgeFileEntity extends BaseEntity {

    @TableId(value = "id", type = IdType.ASSIGN_UUID)
    private String id;

    @TableField("knowledge_base_id")
    private String knowledgeBaseId;

    @TableField("file_name")
    private String fileName;

    @TableField("file_path")
    private String filePath;

    @TableField("file_type")
    private String fileType;

    @TableField("file_size")
    private Long fileSize;

    @TableField(value = "status", typeHandler = KnowledgeFileStatusConverter.class)
    private KnowledgeFileStatus status = KnowledgeFileStatus.PENDING;

    @TableField("chunk_count")
    private Integer chunkCount = 0;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
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
    public KnowledgeFileStatus getStatus() { return status; }
    public void setStatus(KnowledgeFileStatus status) { this.status = status; }
    public Integer getChunkCount() { return chunkCount; }
    public void setChunkCount(Integer chunkCount) { this.chunkCount = chunkCount; }
}

