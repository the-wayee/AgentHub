package com.xiaoguai.agentx;

import com.xiaoguai.agentx.infrastrcture.email.EmailService;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AgentHubApplicationTests {

    private static final Logger logger = LoggerFactory.getLogger(AgentHubApplicationTests.class);

    @Resource
    private EmailService emailService;


    @Test
    void testEmail() {
        emailService.sendVerificationEmail("2216783205@qq.com", "10086");
    }
}
