package com.xiaoguai.agentx.infrastrcture.config;


import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.s3.S3ProviderEnum;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "s3")
public class S3Properties {

    private String provider;
    private ProviderProperties aliyun;

    public ProviderProperties getProviderProperties() {
        S3ProviderEnum instance = S3ProviderEnum.getInstance(provider);
        switch (instance) {
            case ALIYUN -> {
                return aliyun;
            }
            default -> {
                throw new BusinessException("未找到服务商配置");
            }
        }
    }

    public static class ProviderProperties {
        private String endpoint;
        private String accessKey;
        private String secretKey;
        private String bucketName;
        private String region;

        public String getEndpoint() {
            return endpoint;
        }

        public void setEndpoint(String endpoint) {
            this.endpoint = endpoint;
        }

        public String getAccessKey() {
            return accessKey;
        }

        public void setAccessKey(String accessKey) {
            this.accessKey = accessKey;
        }

        public String getSecretKey() {
            return secretKey;
        }

        public void setSecretKey(String secretKey) {
            this.secretKey = secretKey;
        }

        public String getBucketName() {
            return bucketName;
        }

        public void setBucketName(String bucketName) {
            this.bucketName = bucketName;
        }

        public String getRegion() {
            return region;
        }

        public void setRegion(String region) {
            this.region = region;
        }
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public ProviderProperties getAliyun() {
        return aliyun;
    }

    public void setAliyun(ProviderProperties aliyun) {
        this.aliyun = aliyun;
    }

}
