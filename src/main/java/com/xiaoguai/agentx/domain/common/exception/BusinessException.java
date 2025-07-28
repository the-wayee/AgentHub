package com.xiaoguai.agentx.domain.common.exception;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-25 10:07
 * @Description: 业务异常
 */
public class BusinessException extends RuntimeException {

    private String errorCode;

    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }

    public BusinessException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}