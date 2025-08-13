package com.xiaoguai.agentx.infrastrcture.entity;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 16:19
 * @Description: Operator
 */
public enum Operator {

    USER,
    ADMIN;

    public boolean needCheckUserId() {
        return this == USER;
    }
}
