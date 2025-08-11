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
 * @Date: 2025-08-11 17:36
 * @Description: SlidingWindowOverflowStrategy
 */
public class SlidingWindowOverflowStrategy implements TokenOverflowStrategy {

    /**
     * 滑动窗后Token溢出配置
     */
    private final TokenOverflowConfig config;

    /**
     * 默认最大Token数量
     */
    private static final Integer DEFAULT_MAX_TOKENS = 4096;

    /**
     * 默认缓冲比例
     */
    private static final Double DEFAULT_RESERVE_RATIO = 0.1;

    public SlidingWindowOverflowStrategy(TokenOverflowConfig config) {
        this.config = config;
    }

    @Override
    public TokenProcessResult process(List<TokenMessage> messages) {
        return null;
    }

    @Override
    public boolean needProcessing(List<TokenMessage> messages) {
        if (messages == null || messages.isEmpty()) {
            return false;
        }
        Integer totalTokens = calculateTotalTokens(messages);
        Integer maxTokens = config.getMaxTokens();
        return totalTokens > maxTokens;
    }

    @Override
    public String getName() {
        return TokenOverflowStrategyEnum.SLIDING_WINDOW.name();
    }

    private Integer calculateTotalTokens(List<TokenMessage> messages) {
        return messages.stream()
                .mapToInt(e -> e == null ? 0 : e.getTokenCount())
                .sum();
    }
}
