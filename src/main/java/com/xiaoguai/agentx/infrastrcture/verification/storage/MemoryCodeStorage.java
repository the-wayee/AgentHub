package com.xiaoguai.agentx.infrastrcture.verification.storage;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 12:52
 * @Description: 内存验证码存储
 */
@Service
public class MemoryCodeStorage implements CodeStorage {

    private static final Logger logger =  LoggerFactory.getLogger(MemoryCodeStorage.class);
    // 存储验证码Map
    private static final Map<String, CodeInfo> CODE_MAP = new ConcurrentHashMap<>();

    private final ScheduledExecutorService scheduler;

    // 清理任务间隔(分钟)
    private static final int CLEANUP_INTERVAL_MINUTES = 5;

    public MemoryCodeStorage() {

        this.scheduler = Executors.newSingleThreadScheduledExecutor();

        scheduler.scheduleAtFixedRate(this::cleanExpiredCodes, CLEANUP_INTERVAL_MINUTES,
                CLEANUP_INTERVAL_MINUTES, TimeUnit.MINUTES);

        logger.info("验证码过期清理任务已启动，每" + CLEANUP_INTERVAL_MINUTES + "分钟执行一次");

    }

    @Override
    public void storeCode(String key, String code, long expireTime) {
        long expirationTime = System.currentTimeMillis() + expireTime;
        CODE_MAP.put(key, new CodeInfo(code, expirationTime));
    }

    @Override
    public String getCode(String key) {
        CodeInfo codeInfo = CODE_MAP.get(key);
        if (codeInfo == null) {
            return null;
        }
        if (System.currentTimeMillis() > codeInfo.getExpireTime()) {
            CODE_MAP.remove(key);
            return null;
        }
        return codeInfo.getCode();
    }

    @Override
    public boolean verifyCode(String key, String code) {
        String rawCode = getCode(key);
        if (rawCode == null) {
            return false;
        }
        boolean res = rawCode.equals(code);
        if (res) {
            removeCode(key);
        }

        return res;
    }

    @Override
    public void removeCode(String key) {
        CODE_MAP.remove(key);
    }

    @Override
    public void cleanExpiredCodes() {

    }



    /**
     * 验证码信息内部类
     */
    private static class CodeInfo {
        private final String code;

        private final long expireTime;

        private CodeInfo(String code, long expireTime) {
            this.code = code;
            this.expireTime = expireTime;
        }

        public String getCode() {
            return code;
        }

        public long getExpireTime() {
            return expireTime;
        }
    }
}
