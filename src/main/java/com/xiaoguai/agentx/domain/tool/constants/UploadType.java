package com.xiaoguai.agentx.domain.tool.constants;


import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 19:53
 * @Description: 上传文件类型
 */
public enum UploadType {


    GITHUB, ZIP;

    public static UploadType fromCode(String code) {
        for (UploadType type : values()) {
            if (type.name().equals(code)) {
                return type;
            }
        }
        throw new BusinessException("未知的上传类型码: " + code);
    }
}
