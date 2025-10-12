package com.xiaoguai.agentx.application.conversation.service.message.agent;


import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.mcp.client.DefaultMcpClient;
import dev.langchain4j.mcp.client.McpClient;
import dev.langchain4j.mcp.client.transport.McpTransport;
import dev.langchain4j.mcp.client.transport.http.HttpMcpTransport;
import dev.langchain4j.service.tool.ToolProvider;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-15 18:11
 * @Description: 工具调用管理
 */
@Component
public class ToolCallManager {

    /**
     * 创建Mcp工具调用
     * @param tools 工具urls
     */
    public ToolProvider createToolProvider(List<String> tools) {
        List<McpClient> clients = new ArrayList<>();
        for (String url : tools) {
            McpTransport transport = new HttpMcpTransport.Builder()
                    .logRequests(true)
                    .logResponses(true)
                    .sseUrl(url)
                    .build();

            McpClient client = new DefaultMcpClient.Builder()
                    .transport(transport)
                    .build();

            clients.add(client);
        }

        return McpToolProvider.builder()
                .mcpClients(clients)
                .build();
    }

    /**
     * 获取可用工具
     *
     * @return urls
     */
    public List<String> getAvailableTools() {
        return List.of("http://localhost:8005/sse?api_key=123456&workspaceId=1");
    }
}
