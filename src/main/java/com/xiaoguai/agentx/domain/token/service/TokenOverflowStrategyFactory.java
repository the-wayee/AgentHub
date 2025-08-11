package com.xiaoguai.agentx.domain.token.service;


import com.xiaoguai.agentx.domain.token.model.config.TokenOverflowConfig;
import com.xiaoguai.agentx.domain.token.model.enums.TokenOverflowStrategyEnum;
import com.xiaoguai.agentx.domain.token.service.impl.NoTokenOverflowStrategy;
import com.xiaoguai.agentx.domain.token.service.impl.SlidingWindowOverflowStrategy;
import com.xiaoguai.agentx.domain.token.service.impl.SummerizeTokenOverflowStrategy;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-11 20:52
 * @Description: Token溢出策略工厂
 */
public class TokenOverflowStrategyFactory {


    /**
     * 获取策略实例
     * @param strategyType 策略类型
     * @param config 策略配置
     */
    public static TokenOverflowStrategy createStrategy(TokenOverflowStrategyEnum strategyType,
                                                       TokenOverflowConfig config) {
        if (strategyType == null) {
            return new NoTokenOverflowStrategy();
        }
        switch (strategyType) {
            case SLIDING_WINDOW -> {
                return new SlidingWindowOverflowStrategy(config);
            }
            case SUMMARIZE -> {
                return new SummerizeTokenOverflowStrategy(config);
            }
            default -> {
                return new NoTokenOverflowStrategy();
            }
        }
    }

    /**
     * 获取策略实例
     * @param config 策略配置
     */
    public static TokenOverflowStrategy createStrategy(TokenOverflowConfig config) {
        if (config == null) {
            return new NoTokenOverflowStrategy();
        }
        return createStrategy(config.getStrategyType(), config);
    }
}
