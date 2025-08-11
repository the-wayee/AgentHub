package com.xiaoguai.agentx.domain.token.service;


import com.xiaoguai.agentx.domain.token.model.TokenMessage;
import com.xiaoguai.agentx.domain.token.model.TokenProcessResult;
import com.xiaoguai.agentx.domain.token.model.config.TokenOverflowConfig;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-11 20:58
 * @Description: Token领域服务
 * 封装Token超限处理的核心逻辑
 */
@Service
public class TokenDomainService {

    /**
     * 处理消息
     * @param messages 消息列表
     * @param config 配置
     */
    public TokenProcessResult processMessages(List<TokenMessage> messages, TokenOverflowConfig config) {
        // 获取策略实例
        TokenOverflowStrategy strategy = TokenOverflowStrategyFactory.createStrategy(config);
        // 执行处理
        return strategy.process(messages);
    }
}
