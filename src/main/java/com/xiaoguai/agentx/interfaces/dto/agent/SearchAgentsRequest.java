package com.xiaoguai.agentx.interfaces.dto.agent;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-30 16:19
 * @Description: 模糊搜索Agent列表
 */
public class SearchAgentsRequest {

    private String name;

    public SearchAgentsRequest() {
    }

    public SearchAgentsRequest(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
