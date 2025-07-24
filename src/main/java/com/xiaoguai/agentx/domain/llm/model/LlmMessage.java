package com.xiaoguai.agentx.domain.llm.model;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-23 20:43
 * @Description: LLM消息
 */
public class LlmMessage {

    /**
     * 对话角色
     */
    private String role;

    /**
     * 对话内容
     */
    private String content;

    public LlmMessage(String role, String content) {
        this.role = role;
        this.content = content;
    }

    public static LlmMessage ofUser(String content) {
        return new LlmMessage("user", content);
    }

    public static LlmMessage ofAssistant(String content) {
        return new LlmMessage("assistant", content);
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
