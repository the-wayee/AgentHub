package com.xiaoguai.agentx.interfaces.dto.agent;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-26 17:31
 * @Description: 创建会话并且聊天
 */
public class CreateAndChatRequest {

    /**
     * 会话标题
     */
    private String title;

    /**
     * 会话描述
     */
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
