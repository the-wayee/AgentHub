package com.xiaoguai.agentx.domain.llm.model.enums;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 20:36
 * @Description: 模型类型
 */
public enum ModelType {

    NORMAL("NORMAL", "普通模型"),
    EMBEDDING("EMBEDDING", "嵌入模型");

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
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new BusinessException("Unknown model type code: " + code);
    }

}
