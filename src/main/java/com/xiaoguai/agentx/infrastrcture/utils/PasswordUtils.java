package com.xiaoguai.agentx.infrastrcture.utils;


import cn.hutool.crypto.digest.BCrypt;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 12:18
 * @Description: PasswordUtils
 */
public class PasswordUtils {

    /**
     * 密码加密
     */
    public static String encode(String password) {
        return BCrypt.hashpw(password);
    }

    /**
     * 验证密码
     * @param password 原始密码
     * @param encodePassword 加密后的密码
     */
    public static boolean matches(String password, String encodePassword) {
        return BCrypt.checkpw(password, encodePassword);
    }

}
