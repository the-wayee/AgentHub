package com.xiaoguai.agentx.domain.llm.model.config;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 20:34
 * @Description: 模型配置
 */
public class LLMModelConfig {
    /**
     * 最大上下文长度
     */
    private Integer maxContextLength;

    public Integer getMaxContextLength() {
        return maxContextLength;
    }

    public void setMaxContextLength(Integer maxContextLength) {
        this.maxContextLength = maxContextLength;
    }
}
