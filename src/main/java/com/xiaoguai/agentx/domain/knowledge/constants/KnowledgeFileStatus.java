package com.xiaoguai.agentx.domain.knowledge.constants;

/**
 * 知识文件状态
 */
public enum KnowledgeFileStatus {
    /**
     * 等待处理
     */
    PENDING,
    /**
     * 文件上传完成，准备拆分
     */
    UPLOADING,
    /**
     * 拆分阶段
     */
    SPLITTING,
    /**
     * 嵌入阶段
     */
    EMBEDDING,
    /**
     * 旧版处理中状态，保留兼容
     */
    PROCESSING,
    COMPLETED,
    FAILED;

    public static KnowledgeFileStatus fromCode(String name) {
        for (KnowledgeFileStatus s : values()) {
            if (s.name().equalsIgnoreCase(name)) {
                return s;
            }
        }
        return null;
    }
}
