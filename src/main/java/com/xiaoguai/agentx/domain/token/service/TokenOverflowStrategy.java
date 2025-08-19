package com.xiaoguai.agentx.domain.token.service;


import com.xiaoguai.agentx.domain.token.model.TokenMessage;
import com.xiaoguai.agentx.domain.token.model.TokenProcessResult;
import com.xiaoguai.agentx.domain.token.model.config.TokenOverflowConfig;
import org.apache.catalina.LifecycleState;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-11 15:13
 * @Description: Token移除策略
 */
public interface TokenOverflowStrategy {

    /**
     * 处理Token上下文
     */
    TokenProcessResult process(List<TokenMessage> messages);


    /**
     * 是否需要处理
     */
    boolean needProcessing(List<TokenMessage> messages);

    /**
     * 获取策略名称
     */
    String getName();
}
