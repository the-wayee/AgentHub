package com.xiaoguai.agentx.interfaces.dto.tool;


import com.xiaoguai.agentx.interfaces.dto.Page;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-08 14:54
 * @Description: 分页查询工具市场请求
 */
public class QueryToolsRequest extends Page {

    /**
     * 工具名称
     */
    private String toolName;

    public String getToolName() {
        return toolName;
    }

    public void setToolName(String toolName) {
        this.toolName = toolName;
    }
}
