package com.xiaoguai.agentx.domain.tool.model.config;


import java.util.Map;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 20:07
 * @Description: 工具定义
 */
public class ToolDefinition {
    /** 工具名称 */
    private String name;

    /** 工具描述 */
    private String description;

    /** 参数定义 */
    private Map<String, Object> parameters;

    /** 是否启用 */
    private Boolean enabled;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Map<String, Object> getParameters() {
        return parameters;
    }

    public void setParameters(Map<String, Object> parameters) {
        this.parameters = parameters;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}
