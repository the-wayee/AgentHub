package com.xiaoguai.agentx;

import com.xiaoguai.agentx.infrastrcture.email.EmailService;
import dev.langchain4j.agent.tool.ToolSpecification;
import dev.langchain4j.mcp.client.DefaultMcpClient;
import dev.langchain4j.mcp.client.McpClient;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
class AgentHubApplicationTests {

    private static final Logger logger = LoggerFactory.getLogger(AgentHubApplicationTests.class);

    @Resource
    private EmailService emailService;


    @Test
    void testEmail() {
        emailService.sendVerificationEmail("2216783205@qq.com", "10086");
    }

    @Test
    void testMcpList() {
        DefaultMcpClient.Builder builder = new DefaultMcpClient.Builder();
        DefaultMcpClient client = builder.build();
        List<ToolSpecification> toolSpecifications = client.listTools();
    }
}
