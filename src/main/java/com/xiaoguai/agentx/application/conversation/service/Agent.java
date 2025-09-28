package com.xiaoguai.agentx.application.conversation.service;


import dev.langchain4j.service.TokenStream;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-26 16:31
 * @Description: Agent
 */
public interface Agent {

    TokenStream chat(String prompt);
}
