package com.xiaoguai.agentx.interfaces.api.common;

import com.aliyun.oss.OSS;
import com.aliyun.oss.common.auth.ServiceSignature;
import com.xiaoguai.agentx.infrastrcture.config.S3Properties;
import com.xiaoguai.agentx.infrastrcture.config.S3Properties.ProviderProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.UUID;

@RestController
@RequestMapping("/s3")
public class FileUploadController {

    private final S3Properties s3Properties;
    private final OSS ossClient;

    private static final long EXPIRE_SECONDS = 300; // 5分钟
    private static final DateTimeFormatter ISO8601_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);

    public FileUploadController(S3Properties s3Properties, OSS ossClient) {
        this.s3Properties = s3Properties;
        this.ossClient = ossClient;
    }

    /**
     * 获取阿里云 OSS 上传凭证（前端直传使用）
     */
    @GetMapping("/presign")
    public Result<AliyunOssPolicy> getAliyunUploadSign(@RequestParam String fileName) {
        ProviderProperties prop = s3Properties.getAliyun();

        // 构造目录 + 文件名
        String dir = "AgentHub_" + DateTimeFormatter.ofPattern("yyyyMMdd").format(Instant.now().atZone(ZoneOffset.systemDefault())) + "/";
        String key = dir + UUID.randomUUID() + "_" + fileName;

        // 构造 OSS host
        String host = String.format("https://%s.%s", prop.getBucketName(),
                prop.getEndpoint().replaceFirst("^https?://", ""));

        // 策略过期时间
        Instant expireTime = Instant.now().plusSeconds(EXPIRE_SECONDS);

        // 构建上传策略
        String policyJson = String.format("{\"expiration\":\"%s\",\"conditions\":[[\"starts-with\",\"$key\",\"%s\"]]}",
                ISO8601_FORMATTER.format(expireTime), dir);

        String policyBase64 = Base64.getEncoder().encodeToString(policyJson.getBytes(StandardCharsets.UTF_8));
        String signature = ServiceSignature.create().computeSignature(prop.getSecretKey(), policyBase64);

        // 构建返回结果
        AliyunOssPolicy result = new AliyunOssPolicy();
        result.setAccessKeyId(prop.getAccessKey());
        result.setHost(host);
        result.setDir(dir);
        result.setKey(key);
        result.setPolicy(policyBase64);
        result.setSignature(signature);
        result.setExpire(expireTime.getEpochSecond());
        result.setFinalUrl(host + "/" + key);

        return Result.success(result);
    }

    public static class AliyunOssPolicy {
        private String accessKeyId;
        private String policy;
        private String signature;
        private String dir;
        private String host;
        private String key;
        private long expire;
        private String finalUrl;

        public String getAccessKeyId() {
            return accessKeyId;
        }

        public void setAccessKeyId(String accessKeyId) {
            this.accessKeyId = accessKeyId;
        }

        public String getPolicy() {
            return policy;
        }

        public void setPolicy(String policy) {
            this.policy = policy;
        }

        public String getSignature() {
            return signature;
        }

        public void setSignature(String signature) {
            this.signature = signature;
        }

        public String getDir() {
            return dir;
        }

        public void setDir(String dir) {
            this.dir = dir;
        }

        public String getHost() {
            return host;
        }

        public void setHost(String host) {
            this.host = host;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public long getExpire() {
            return expire;
        }

        public void setExpire(long expire) {
            this.expire = expire;
        }

        public String getFinalUrl() {
            return finalUrl;
        }

        public void setFinalUrl(String finalUrl) {
            this.finalUrl = finalUrl;
        }
    }
}