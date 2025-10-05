package com.xiaoguai.agentx.infrastrcture.verification;


import cn.hutool.captcha.CaptchaUtil;
import cn.hutool.captcha.LineCaptcha;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 13:06
 * @Description: 图形验证码
 */
public class CaptchaUtils {

    // 图形验证码存储
    private static final Map<String, CaptchaInfo> CAPTCHA_MAP = new ConcurrentHashMap<>();

    // 验证码有效期（分钟）
    private static final int EXPIRATION_MINUTES = 5;

    /**
     * 生成图形验证码
     */
    public static CaptchaResult generateCaptcha() {
        LineCaptcha captcha = CaptchaUtil.createLineCaptcha(120, 40, 4, 100);

        String uuid = UUID.randomUUID().toString();

        long expireTime = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(EXPIRATION_MINUTES);
        String imageBase64 = captcha.getImageBase64();
        String code = captcha.getCode();
        CAPTCHA_MAP.put(uuid, new CaptchaInfo(code, expireTime));
        return new CaptchaResult(uuid, imageBase64);
    }

    public static boolean verifyCaptcha(String uuid, String code) {
        if (uuid == null || code == null) {
            return false;
        }

        CaptchaInfo captchaInfo = CAPTCHA_MAP.get(uuid);
        if (captchaInfo == null) {
            return false;
        }
        // 检查是否过期
        if (System.currentTimeMillis() > captchaInfo.getExpirationTime()) {
            CAPTCHA_MAP.remove(uuid);
            return false;
        }

        // 检查验证码
        boolean res = code.equalsIgnoreCase(captchaInfo.getCode());
        if (res) {
            CAPTCHA_MAP.remove(uuid);
        }
        return res;
    }

    // 内部类 - 验证码信息
    private static class CaptchaInfo {
        private final String code;
        private final long expirationTime;

        public CaptchaInfo(String code, long expirationTime) {
            this.code = code;
            this.expirationTime = expirationTime;
        }

        public String getCode() {
            return code;
        }

        public long getExpirationTime() {
            return expirationTime;
        }
    }


    public static class CaptchaResult {

        private final String uuid;

        private final String imageBase64;

        public CaptchaResult(String uuid, String imageBase64) {
            this.uuid = uuid;
            this.imageBase64 = imageBase64;
        }

        public String getUuid() {
            return uuid;
        }

        public String getImageBase64() {
            return imageBase64;
        }
    }

}
