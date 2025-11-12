package com.xiaoguai.agentx.domain.knowledge.constants;

/**
 * 发布审核状态
 */
public enum KnowledgePublishStatus {
    REVIEWING,
    APPROVED,
    REJECTED;

    public static KnowledgePublishStatus fromCode(String name) {
        for (KnowledgePublishStatus s : values()) {
            if (s.name().equalsIgnoreCase(name)) {
                return s;
            }
        }
        return null;
    }
}

