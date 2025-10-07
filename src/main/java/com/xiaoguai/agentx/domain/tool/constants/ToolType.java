package com.xiaoguai.agentx.domain.tool.constants;


import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 19:53
 * @Description: 工具类型美剧
 */
public enum ToolType {

    MCP;
    public static ToolType fromCode(String code) {
        for (ToolType type : values()) {
            if (type.name().equals(code)) {
                return type;
            }
        }
        throw new BusinessException("未知的工具类型码: " + code);
    }
}
