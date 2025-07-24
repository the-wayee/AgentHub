package com.xiaoguai.agentx.domain.llm.model;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-23 20:47
 * @Description: LLM响应
 */
public class LlmResponse {

    /**
     * 返回内容
     */
    private String content;

    /**
     * 供应商
     */
    private String provider;

    /**
     * 模型名称
     */
    private String model;

    /**
     * 完成原因
     */
    private String finishReason;

    /**
     * 使用的token数量
     */
    private Integer tokenUsage;


    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getFinishReason() {
        return finishReason;
    }

    public void setFinishReason(String finishReason) {
        this.finishReason = finishReason;
    }

    public Integer getTokenUsage() {
        return tokenUsage;
    }

    public void setTokenUsage(Integer tokenUsage) {
        this.tokenUsage = tokenUsage;
    }


}
