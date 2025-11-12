package com.xiaoguai.agentx.domain.knowledge.constants;

/**
 * 可见性枚举
 */
public enum Visibility {
    PRIVATE,
    PUBLIC;

    public static Visibility fromCode(String name) {
        for (Visibility v : values()) {
            if (v.name().equalsIgnoreCase(name)) {
                return v;
            }
        }
        return null;
    }
}

