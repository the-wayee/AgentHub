package com.xiaoguai.agentx.infrastrcture.auth;


import com.alibaba.ttl.TransmittableThreadLocal;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-25 11:21
 * @Description: 用户上下文
 */
public class UserContext {

    private static final TransmittableThreadLocal<String> USER_HOLDER = new TransmittableThreadLocal<>();


    /**
     * 设置用户ID
     */
    public static void setUserId(String userId) {
        USER_HOLDER.set(userId);
    }

    /**
     * 上下文获取用户ID
     */
    public static String getUserId() {
        return USER_HOLDER.get();
    }

    /**
     * 清除线程变量
     */
    public static void clear() {
        USER_HOLDER.remove();
    }
}
