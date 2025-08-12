package com.xiaoguai.agentx.infrastrcture.llm.protocol.enums;


import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 17:24
 * @Description: 提供商协议
 */
public enum ProviderProtocol {

    OPENAI("OpenAI"),
    DASHSCOPE("阿里百炼"),
    ZHIPU("清华智谱");
    private final String name;

    ProviderProtocol(String name) {
        this.name = name;
    }

    public static ProviderProtocol getByName(String name) {
        for (ProviderProtocol value : values()) {
            if (value.name.equals(name)) {
                return value;
            }
        }
        throw new BusinessException("Unknown model type name: " + name);
    }

    public String getName() {
        return name;
    }
}
