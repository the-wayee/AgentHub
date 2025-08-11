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
 * @Date: 2025-08-11 17:30
 * @Description:
 * 无策略的Token超限处理实现
 * 不对消息进行任何处理，保留所有消息
 */
public class NoTokenOverflowStrategy implements TokenOverflowStrategy {

    /**
     * 策略配置
     */
    private TokenOverflowConfig config;


    public NoTokenOverflowStrategy() {
        this.config = TokenOverflowConfig.createDefault();
    }

    public NoTokenOverflowStrategy(TokenOverflowConfig config) {
        this.config = config == null ? TokenOverflowConfig.createDefault() : config;
    }


    @Override
    public TokenProcessResult process(List<TokenMessage> messages) {
        TokenProcessResult result = new TokenProcessResult();
        result.setRetainedMessages(messages);
        result.setStrategyName(getName());
        result.setTotalTokes(calculateTotalTokens(messages));
        result.setProcessed(false);
        return result;
    }

    @Override
    public boolean needProcessing(List<TokenMessage> messages) {
        // 无策略不需要处理
        return false;
    }

    @Override
    public String getName() {
        return TokenOverflowStrategyEnum.NONE.name();
    }

    /**
     * 计算token数量
     */
    private Integer calculateTotalTokens(List<TokenMessage> messages) {
        return messages.stream()
                .mapToInt(e -> e == null ? 0 : e.getTokenCount())
                .sum();
    }
}
