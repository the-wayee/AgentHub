package com.xiaoguai.agentx.domain.llm.model;


import java.util.ArrayList;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-23 20:45
 * @Description: LLM请求
 */
public class LlmRequest {

    /**
     * 选择的模型
     */
    private String model;

    /**
     * 消息列表
     */
    private List<LlmMessage> messages;

    /**
     * 温度
     */
    private Double temperature;

    /**
     * 最大生成token数
     */
    private Integer maxTokens;

    /**
     * 是否流式响应
     */
    private Boolean stream;

    public LlmRequest() {
        messages = new ArrayList<>();
        temperature = 0.7;
        stream = false;
    }

    public LlmRequest addUserMessage(String content){
        messages.add(LlmMessage.ofUser(content));
        return this;
    }
    public LlmRequest addAssistantMessage(String content){
        messages.add(LlmMessage.ofAssistant(content));
        return this;
    }

    public Integer getMaxTokens() {
        return maxTokens;
    }

    public void setMaxTokens(Integer maxTokens) {
        this.maxTokens = maxTokens;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public List<LlmMessage> getMessages() {
        return messages;
    }

    public void setMessages(List<LlmMessage> messages) {
        this.messages = messages;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Boolean getStream() {
        return stream;
    }

    public void setStream(Boolean stream) {
        this.stream = stream;
    }


}
