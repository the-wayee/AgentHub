package com.xiaoguai.agentx.domain.token.service.impl;


import com.xiaoguai.agentx.domain.token.model.TokenMessage;
import com.xiaoguai.agentx.domain.token.model.TokenProcessResult;
import com.xiaoguai.agentx.domain.token.model.config.TokenOverflowConfig;
import com.xiaoguai.agentx.domain.token.model.enums.TokenOverflowStrategyEnum;
import com.xiaoguai.agentx.domain.token.service.TokenOverflowStrategy;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-11 17:44
 * @Description: 摘要最大Token策略
 */
public class SummerizeTokenOverflowStrategy implements TokenOverflowStrategy {

    /**
     * 滑动窗后Token溢出配置
     */
    private final TokenOverflowConfig config;

    /**
     * 默认最大Token数量
     */
    private static final Integer DEFAULT_MAX_TOKENS = 4096;

    /**
     * 默认消息数量阈值
     */
    private static final Integer DEFAULT_SUMMARY_THRESHOLD = 20;

    public SummerizeTokenOverflowStrategy(TokenOverflowConfig config) {
        this.config = config;
    }

//    private static final




    @Override
    public TokenProcessResult process(List<TokenMessage> messages) {
        return null;
    }

    @Override
    public boolean needProcessing(List<TokenMessage> messages) {
        return false;
    }

    @Override
    public String getName() {
        return TokenOverflowStrategyEnum.SUMMARIZE.name();
    }
}
