package com.xiaoguai.agentx.domain.llm.callback;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-25 14:11
 * @Description: 流式响应回调
 */
@FunctionalInterface
public interface StreamResponseHandler {

    /**
     * 流式输出分块响应
     */
    void onChunk(String chunk, boolean isLast, boolean isReasoning);
}
