package com.xiaoguai.agentx.domain.token.model.config;


import com.xiaoguai.agentx.domain.llm.model.config.ProviderConfig;
import com.xiaoguai.agentx.domain.token.model.enums.TokenOverflowStrategyEnum;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-11 15:44
 * @Description: Token移除配置
 */
public class TokenOverflowConfig {

    /**
     * 策略类型
     */
    private TokenOverflowStrategyEnum strategyType;

    /**
     * 最大上下文Token数量
     * 适用滑动窗口和摘要信息
     */
    private Integer maxTokens;

    /**
     * 保留缓冲比例，滑动窗口策略
     * 范围0-1之间的小数，表示预留的空间比例
     */
    private Double reserveRatio;

    /**
     * 摘要触发阈值（消息数量），适用于摘要策略
     */
    private Integer summaryThreshold;

    /**
     * 供应商配置，获取protocol
     */
    private ProviderConfig providerConfig;

    public TokenOverflowConfig() {
    }

    public TokenOverflowConfig(TokenOverflowStrategyEnum strategyType) {
        this.strategyType = strategyType;
    }


    /**
     * 默认创建无策略
     */
    public static TokenOverflowConfig createDefault() {
        return new TokenOverflowConfig(TokenOverflowStrategyEnum.NONE);
    }

    /**
     * 创建滑动窗口策略配置
     * @param maxTokens 上下文最大Token数量
     * @param reserveRatio 缓冲比例
     */
    public static TokenOverflowConfig createSlidingWidowConfig(int maxTokens, Double reserveRatio) {
        TokenOverflowConfig config = new TokenOverflowConfig(TokenOverflowStrategyEnum.SLIDING_WINDOW);
        config.setMaxTokens(maxTokens);
        config.setReserveRatio(reserveRatio != null ? reserveRatio : 0.1);
        return config;
    }

    /**
     *  创建消息摘要策略配置
     * @param maxTokens 上下文最大Token数量
     * @param summaryThreshold 消息阈值
     */
    public static TokenOverflowConfig createSummaryConfig(int maxTokens, Integer summaryThreshold) {
        TokenOverflowConfig config = new TokenOverflowConfig(TokenOverflowStrategyEnum.SUMMARIZE);
        config.setMaxTokens(maxTokens);
        config.setSummaryThreshold(summaryThreshold);
        return config;
    }

    public TokenOverflowStrategyEnum getStrategyType() {
        return strategyType;
    }

    public void setStrategyType(TokenOverflowStrategyEnum strategyType) {
        this.strategyType = strategyType;
    }

    public Integer getMaxTokens() {
        return maxTokens;
    }

    public void setMaxTokens(Integer maxTokens) {
        this.maxTokens = maxTokens;
    }

    public Double getReserveRatio() {
        return reserveRatio;
    }

    public void setReserveRatio(Double reserveRatio) {
        this.reserveRatio = reserveRatio;
    }

    public Integer getSummaryThreshold() {
        return summaryThreshold;
    }

    public void setSummaryThreshold(Integer summaryThreshold) {
        this.summaryThreshold = summaryThreshold;
    }

    public ProviderConfig getProviderConfig() {
        return providerConfig;
    }

    public void setProviderConfig(ProviderConfig providerConfig) {
        this.providerConfig = providerConfig;
    }


}
