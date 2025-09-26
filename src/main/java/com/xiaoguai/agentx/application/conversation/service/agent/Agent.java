package com.xiaoguai.agentx.application.conversation.service.agent;


import dev.langchain4j.data.message.AiMessage;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-26 16:31
 * @Description: Agent
 */
public interface Agent {

    AiMessage chat(String prompt);
}
