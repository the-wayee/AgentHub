package com.xiaoguai.agentx.interfaces.dto.agent;


import com.xiaoguai.agentx.domain.agent.model.AgentTool;
import com.xiaoguai.agentx.domain.agent.model.ModelConfig;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-30 15:50
 * @Description: 更新Agent参数
 */
public class UpdateAgentRequest {

    // 基本信息字段
    private String name;
    private String avatar;
    private String description;

    // 配置信息字段
    private String systemPrompt;
    private String welcomeMessage;
    private ModelConfig modelConfig;
    private List<AgentTool> tools;
    private List<String> knowledgeBaseIds;

    public UpdateAgentRequest() {
    }

    public UpdateAgentRequest(String name, String avatar, String description, String systemPrompt, String welcomeMessage, ModelConfig modelConfig, List<AgentTool> tools, List<String> knowledgeBaseIds) {
        this.name = name;
        this.avatar = avatar;
        this.description = description;
        this.systemPrompt = systemPrompt;
        this.welcomeMessage = welcomeMessage;
        this.modelConfig = modelConfig;
        this.tools = tools;
        this.knowledgeBaseIds = knowledgeBaseIds;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSystemPrompt() {
        return systemPrompt;
    }

    public void setSystemPrompt(String systemPrompt) {
        this.systemPrompt = systemPrompt;
    }

    public String getWelcomeMessage() {
        return welcomeMessage;
    }

    public void setWelcomeMessage(String welcomeMessage) {
        this.welcomeMessage = welcomeMessage;
    }

    public ModelConfig getModelConfig() {
        return modelConfig;
    }

    public void setModelConfig(ModelConfig modelConfig) {
        this.modelConfig = modelConfig;
    }

    public List<AgentTool> getTools() {
        return tools;
    }

    public void setTools(List<AgentTool> tools) {
        this.tools = tools;
    }

    public List<String> getKnowledgeBaseIds() {
        return knowledgeBaseIds;
    }

    public void setKnowledgeBaseIds(List<String> knowledgeBaseIds) {
        this.knowledgeBaseIds = knowledgeBaseIds;
    }
}
