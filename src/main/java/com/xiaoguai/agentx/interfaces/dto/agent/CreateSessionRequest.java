package com.xiaoguai.agentx.interfaces.dto.agent;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-26 17:11
 * @Description: 创建会话请求
 */
public class CreateSessionRequest {

    /**
     * 标题
     */
    private String title;

    /**
     * 描述
     */
    private String description;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
