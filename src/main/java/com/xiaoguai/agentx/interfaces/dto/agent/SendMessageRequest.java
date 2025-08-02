package com.xiaoguai.agentx.interfaces.dto.agent;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-26 17:34
 * @Description: 发送消息请求体
 */
public class SendMessageRequest {

    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
