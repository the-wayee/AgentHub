package com.xiaoguai.agentx.domain.knowledge.constants;

/**
 * 知识文件状态
 */
public enum KnowledgeFileStatus {
    PENDING,
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

