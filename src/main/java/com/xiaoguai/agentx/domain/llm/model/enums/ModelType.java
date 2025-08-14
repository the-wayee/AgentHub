package com.xiaoguai.agentx.domain.llm.model.enums;


import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 20:36
 * @Description: 模型类型
 */
public enum ModelType {

    NORMAL("normal", "普通模型"),
    VISION("vison", "视觉模型"),
    FUNCTION("function", "工具调用"),
    EMBEDDING("embedding", "嵌入模型");

    private final String code;
    private final String description;

    ModelType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static ModelType fromCode(String code) {
        for (ModelType type : values()) {
            if (type.name().equals(code)) {
                return type;
            }
        }
        throw new BusinessException("Unknown model type code: " + code);
    }

}
