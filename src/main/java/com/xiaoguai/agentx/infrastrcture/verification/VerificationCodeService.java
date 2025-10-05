package com.xiaoguai.agentx.infrastrcture.verification;


import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.verification.storage.CodeStorage;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 13:18
 * @Description: 邮箱验证码服务
 */
@Service
public class VerificationCodeService {

    // 业务类型常量
    public static final String BUSINESS_TYPE_REGISTER = "register";
    public static final String BUSINESS_TYPE_RESET_PASSWORD = "reset_password";

    private final CodeStorage codeStorage;

    // IP对应的限制防刷
    private static final Map<String, IpLimitInfo> IP_LIMIT_INFO_MAP = new ConcurrentHashMap<>();

    // 发送次数限制
    private static final Map<String, LimitInfo> LIMIT_INFO_MAP = new ConcurrentHashMap<>();

    public VerificationCodeService(CodeStorage codeStorage) {
        this.codeStorage = codeStorage;
    }

    // 验证码长度
    private static final int CODE_LENGTH = 4;

    // 验证码有效期（分钟）
    private static final int EXPIRATION_MINUTES = 5;

    // 单个邮箱每日最大发送次数
    private static final int MAX_DAILY_SEND_COUNT = 10;
    // 验证码发送最小间隔（秒）
    private static final int MIN_SEND_INTERVAL_SECONDS = 60;
    // IP每日最大发送次数
    private static final int MAX_DAILY_IP_SEND_COUNT = 20;


    /**
     * 生成验证码
     *
     * @param email 邮箱
     * @param captchaUuid  图形验证码id
     * @param captchaCode  图形验证码code
     * @param ip    客户端id
     */
    public String generateCode(String email, String captchaUuid, String captchaCode, String ip) {
        if (!CaptchaUtils.verifyCaptcha(captchaUuid, captchaCode)) {
            throw new BusinessException("图形验证码错误或已过期");
        }

        // 检查ip限制
        checkIpLimit(ip);

        // 检查发送次数
        checkLimit(email);

        // 生成验证码
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }

        // 计算过期时间
        long expirationMillis = TimeUnit.MINUTES.toMillis(EXPIRATION_MINUTES);

        // 存储验证码
        String storageKey = generateStorageKey(email, BUSINESS_TYPE_REGISTER);
        codeStorage.storeCode(storageKey, code.toString(), expirationMillis);

        // 记录ip次数
        IpLimitInfo ipLimitInfo = IP_LIMIT_INFO_MAP.getOrDefault(ip, new IpLimitInfo());
        ipLimitInfo.incrementCount();
        IP_LIMIT_INFO_MAP.put(ip, ipLimitInfo);

        // 记录发送次数
        LimitInfo limitInfo = LIMIT_INFO_MAP.getOrDefault(email, new LimitInfo());
        limitInfo.incrementCount();
        limitInfo.setLastSendTime(System.currentTimeMillis());
        LIMIT_INFO_MAP.put(email, limitInfo);

        return code.toString();
    }


    private void checkIpLimit(String ip) {
        IpLimitInfo ipLimitInfo = IP_LIMIT_INFO_MAP.get(ip);
        if (ipLimitInfo != null && ipLimitInfo.getDailyCount() > MAX_DAILY_IP_SEND_COUNT) {
            throw new BusinessException("您的IP今日请求次数已达上限，请明天再试");
        }
    }

    private void checkLimit(String email) {
        LimitInfo limitInfo = LIMIT_INFO_MAP.get(email);
        if (limitInfo != null) {
            // 检查发送间隔
            long elapsedSeconds = TimeUnit.MILLISECONDS.toSeconds(System.currentTimeMillis() - limitInfo.getLastSendTime());
            if (elapsedSeconds < MIN_SEND_INTERVAL_SECONDS) {
                throw new BusinessException("发送过于频繁，请" + (MIN_SEND_INTERVAL_SECONDS - elapsedSeconds) + "秒后再试");
            }

            // 检查日发送次数
            if (limitInfo.getDailyCount() >= MAX_DAILY_SEND_COUNT) {
                throw new BusinessException("今日发送次数已达上限，请明天再试");
            }
        }
    }

    /** 生成用于存储的key，包含业务类型前缀 */
    private String generateStorageKey(String email, String businessType) {
        return businessType + ":" + email;
    }
    
    // 限制信息内部类
    private static class LimitInfo {
        private int dailyCount = 0;
        private long lastSendTime = 0;

        public void incrementCount() {
            dailyCount++;
        }

        public int getDailyCount() {
            return dailyCount;
        }

        public long getLastSendTime() {
            return lastSendTime;
        }

        public void setLastSendTime(long lastSendTime) {
            this.lastSendTime = lastSendTime;
        }
    }

    // IP限制信息内部类
    private static class IpLimitInfo {
        private int dailyCount = 0;

        public void incrementCount() {
            dailyCount++;
        }

        public int getDailyCount() {
            return dailyCount;
        }
    }
}
