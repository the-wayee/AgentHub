package com.xiaoguai.agentx.domain.token.service.impl;


import com.xiaoguai.agentx.domain.token.model.TokenMessage;
import com.xiaoguai.agentx.domain.token.model.TokenProcessResult;
import com.xiaoguai.agentx.domain.token.model.config.TokenOverflowConfig;
import com.xiaoguai.agentx.domain.token.model.enums.TokenOverflowStrategyEnum;
import com.xiaoguai.agentx.domain.token.service.TokenOverflowStrategy;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

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

    /**
     * 摘要消息角色特殊标识
     */
    private static final String SUMMARY_ROLE = "summary";

    public SummerizeTokenOverflowStrategy(TokenOverflowConfig config) {
        this.config = config;
    }


    @Override
    public TokenProcessResult process(List<TokenMessage> messages) {
        if (!needProcessing(messages)) {
            TokenProcessResult result = new TokenProcessResult();
            result.setProcessed(false);
            result.setTotalTokes(calculateTotalTokens(messages));
            result.setStrategyName(TokenOverflowStrategyEnum.SUMMARIZE.name());
            result.setRetainedMessages(messages);
            return result;
        }

        // 按照时间排序
        Collections.sort(messages, Comparator.comparing(TokenMessage::getCreatedAt));

        // 需要summary的消息列表
        List<TokenMessage> summaryMessages = messages.subList(0, messages.size() - config.getSummaryThreshold());

        // 需要保留的消息
        List<TokenMessage> retainedMessages = messages.subList(messages.size() - config.getSummaryThreshold(), messages.size());

        // 生成摘要消息
        String summary = generateSummary(summaryMessages);
        TokenMessage summaryMessage = createTokenMessage(summary);

        // 将摘要消息插入头部
        retainedMessages.add(0,  summaryMessage);

        // 组装Result
        TokenProcessResult result = new TokenProcessResult();
        result.setSummary(summary);
        result.setProcessed(true);
        result.setStrategyName(getName());
        result.setRetainedMessages(retainedMessages);
        result.setTotalTokes(calculateTotalTokens(retainedMessages));
        return result;
    }

    @Override
    public boolean needProcessing(List<TokenMessage> messages) {
        if (messages == null || messages.isEmpty()) {
            return false;
        }
        return messages.size() > config.getSummaryThreshold();
    }

    @Override
    public String getName() {
        return TokenOverflowStrategyEnum.SUMMARIZE.name();
    }

    private Integer calculateTotalTokens(List<TokenMessage> messages) {
        return messages.stream()
                .mapToInt(e -> e == null ? 0 : e.getTokenCount())
                .sum();
    }

    /**
     * 生成摘要消息
     */
    private String generateSummary(List<TokenMessage> messages) {
        // TODO 调用LLM生产摘要消息
        return String.format("这是%d条历史数据消息", messages.size());
    }

    /**
     * 生成Token消息
     */
    private TokenMessage createTokenMessage(String summary) {
        TokenMessage tokenMessage = new TokenMessage();
        tokenMessage.setId(UUID.randomUUID().toString());
        tokenMessage.setTokenCount(100); // TODO 这里需要计算
        tokenMessage.setContent(summary);
        tokenMessage.setRole(SUMMARY_ROLE);
        tokenMessage.setCreatedAt(LocalDateTime.now());
        return tokenMessage;
    }
}
