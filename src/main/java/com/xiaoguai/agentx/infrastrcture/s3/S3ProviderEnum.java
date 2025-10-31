package com.xiaoguai.agentx.infrastrcture.s3;

import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;

public enum S3ProviderEnum {

    ALIYUN;

    public static S3ProviderEnum getInstance(String provider) {

        for (S3ProviderEnum value : values()) {
            if (value.name().equalsIgnoreCase(provider)) {
                return value;
            }
        }
        throw new BusinessException("未找到服务商配置");

    }
}
