package com.xiaoguai.agentx.domain.common.exception;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-25 10:06
 * @Description: 实体未找到异常
 */
public class EntityNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public EntityNotFoundException(String message) {
        super(message);
    }

    public EntityNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
