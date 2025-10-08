package com.xiaoguai.agentx;

import com.xiaoguai.agentx.application.conversation.service.Agent;
import com.xiaoguai.agentx.domain.tool.model.config.ToolDefinition;
import com.xiaoguai.agentx.infrastrcture.email.EmailService;
import com.xiaoguai.agentx.infrastrcture.utils.JsonUtils;
import dev.langchain4j.agent.tool.ToolSpecification;
import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.mcp.client.DefaultMcpClient;
import dev.langchain4j.mcp.client.McpClient;
import dev.langchain4j.mcp.client.transport.http.HttpMcpTransport;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.service.AiServices;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
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
        HttpMcpTransport transport = new HttpMcpTransport.Builder()
                .sseUrl("http://localhost:8005/sse?api_key=123456&workspaceId=1")
                .logRequests(true)
                .logResponses(true)
                .build();

        DefaultMcpClient client = new DefaultMcpClient.Builder()
                .transport(transport)
                .build();

        List<ToolSpecification> toolSpecifications = client.listTools();

        toolSpecifications.forEach(each -> {
            ToolDefinition toolDefinition = new ToolDefinition();
            BeanUtils.copyProperties(each, toolDefinition);
            System.out.println(JsonUtils.toJsonString(toolDefinition));
        });
    }
}
