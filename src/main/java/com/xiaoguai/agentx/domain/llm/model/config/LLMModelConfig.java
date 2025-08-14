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

    /**
     * 温度
     */
    private Double temperature;

    /**
     * 是否允许联网搜索
     */
    private Boolean enable_search;

    public Integer getMaxContextLength() {
        return maxContextLength;
    }

    public void setMaxContextLength(Integer maxContextLength) {
        this.maxContextLength = maxContextLength;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Boolean getEnable_search() {
        return enable_search;
    }

    public void setEnable_search(Boolean enable_search) {
        this.enable_search = enable_search;
    }
}
