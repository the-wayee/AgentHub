package com.xiaoguai.agentx.domain.knowledge.model;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.xiaoguai.agentx.infrastrcture.converter.MapConverter;
import com.xiaoguai.agentx.infrastrcture.entity.BaseEntity;

import java.util.Map;

@TableName(value = "knowledge_embedding", autoResultMap = true)
public class KnowledgeEmbeddingEntity extends BaseEntity {

    @TableId(value = "embedding_id")
    private String embeddingId;

    @TableField("file_id")
    private String fileId;

    @TableField("text")
    private String text;

    @TableField(value = "metadata", typeHandler = MapConverter.class)
    private Map<String, Object> metadata;

    @TableField("embedding")
    private String embedding;

    public String getEmbeddingId() { return embeddingId; }
    public void setEmbeddingId(String embeddingId) { this.embeddingId = embeddingId; }
    public String getFileId() { return fileId; }
    public void setFileId(String fileId) { this.fileId = fileId; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    public String getEmbedding() { return embedding; }
    public void setEmbedding(String embedding) { this.embedding = embedding; }
}
