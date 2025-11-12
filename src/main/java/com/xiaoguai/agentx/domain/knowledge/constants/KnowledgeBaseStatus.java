package com.xiaoguai.agentx.domain.knowledge.constants;

/**
 * 知识库状态
 */
public enum KnowledgeBaseStatus {
    /**
     * 草稿
     */
    DRAFT,
    /**
     *已提交
     */
    SUBMITTED,
    /**
     * 审核通过
     */
    APPROVED,
    /**
     * 审核拒绝
     */
    REJECTED,
    /**
     * 已下架
     */
    UNPUBLISHED;

    public static KnowledgeBaseStatus fromCode(String name) {
        for (KnowledgeBaseStatus s : values()) {
            if (s.name().equalsIgnoreCase(name)) {
                return s;
            }
        }
        return null;
    }
}

