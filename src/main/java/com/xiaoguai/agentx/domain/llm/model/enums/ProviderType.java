package com.xiaoguai.agentx.domain.llm.model.enums;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 20:38
 * @Description: ProviderType
 */
public enum ProviderType {
    /**
     * 所有服务商(包括官方和用户自定义)
     */
    ALL("all"),

    /**
     * 官方服务商
     */
    OFFICIAL("official"),

    /**
     * 用户自定义服务商
     */
    CUSTOM("custom");


    private final String type;

    ProviderType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }

    /**
     * 根据code获取对应的枚举值
     * @param code 类型编码
     * @return 对应的枚举，若不存在则默认返回USER类型
     */
    public static ProviderType fromCode(String code) {
        for (ProviderType type : ProviderType.values()) {
            if (type.getType().equals(code)) {
                return type;
            }
        }
        return ProviderType.ALL;
    }

}
