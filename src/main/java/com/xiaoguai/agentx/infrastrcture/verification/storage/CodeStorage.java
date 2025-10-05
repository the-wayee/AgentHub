package com.xiaoguai.agentx.infrastrcture.verification.storage;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 12:49
 * @Description: 验证码存储抽象
 */
public interface CodeStorage {

    /**
     * 存储验证码
     */
    void storeCode(String key, String code, long expireTime);

    /**
     * 获取验证码
     */
    String getCode(String key);

    /**
     * 验证验证码
     */
    boolean verifyCode(String key, String code);

    /**
     * 清除验证码
     */
    void removeCode(String key);

    /**
     * 清除过期验证码
     */
    void cleanExpiredCodes();
}
