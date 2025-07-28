package com.xiaoguai.agentx.domain.common.exception;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-25 10:07
 * @Description: 参数校验异常类
 */
public class ParamValidationException extends BusinessException {

    private static final String DEFAULT_CODE = "PARAM_VALIDATION_ERROR";

    public ParamValidationException(String message) {
        super(DEFAULT_CODE, message);
    }

    public ParamValidationException(String paramName, String message) {
        super(DEFAULT_CODE, String.format("参数[%s]无效: %s", paramName, message));
    }
}