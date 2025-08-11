package com.xiaoguai.agentx.domain.token.model;


import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-11 15:24
 * @Description: Token处理后的结果
 */
public class TokenProcessResult {

    /**
     * 保留的消息列表
     */
    private List<TokenMessage> retainedMessages;

    /**
     * 消息摘要（）
     */
    private String summary;

    /**
     * 总的Token数量
     */
    private int totalTokes;

    /**
     * Token策略名称
     */
    private String strategyName;

    /**
     * 是否处理过
     * true: 消息被处理过（如被截断、摘要等）
     * false: 消息未经处理（原样返回）
     */
    private boolean processed;

    public List<TokenMessage> getRetainedMessages() {
        return retainedMessages;
    }

    public void setRetainedMessages(List<TokenMessage> retainedMessages) {
        this.retainedMessages = retainedMessages;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public int getTotalTokes() {
        return totalTokes;
    }

    public void setTotalTokes(int totalTokes) {
        this.totalTokes = totalTokes;
    }

    public String getStrategyName() {
        return strategyName;
    }

    public void setStrategyName(String strategyName) {
        this.strategyName = strategyName;
    }

    public boolean isProcessed() {
        return processed;
    }

    public void setProcessed(boolean processed) {
        this.processed = processed;
    }
}
