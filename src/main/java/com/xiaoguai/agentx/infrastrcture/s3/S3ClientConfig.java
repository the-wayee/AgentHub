package com.xiaoguai.agentx.infrastrcture.s3;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.xiaoguai.agentx.infrastrcture.config.S3Properties;
import com.xiaoguai.agentx.infrastrcture.config.S3Properties.ProviderProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class S3ClientConfig {

    private final S3Properties s3Properties;

    public S3ClientConfig(S3Properties s3Properties) {
        this.s3Properties = s3Properties;
    }

    @Bean
    public OSS ossClient() {
        ProviderProperties properties = s3Properties.getProviderProperties();
        return new OSSClientBuilder()
                .build(
                        properties.getEndpoint(),
                        properties.getAccessKey(),
                        properties.getSecretKey()
                );
    }
}
