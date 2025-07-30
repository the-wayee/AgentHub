package com.xiaoguai.agentx.interfaces.dto.agent;


import com.xiaoguai.agentx.domain.agent.model.AgentTool;
import com.xiaoguai.agentx.domain.agent.model.ModelConfig;
import com.xiaoguai.agentx.domain.agent.model.enums.AgentType;
import com.xiaoguai.agentx.domain.common.utils.ValidationUtils;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-30 15:24
 * @Description: 创建Agent请求参数
 */
public class CreateAgentRequest {

    /**
     * Agent 名称
     */
    private String name;

    /**
     * 头像
     */
    private String avatar;

    /**
     * 描述
     */
    private String description;

    /**
     * Agent类型
     */
    private AgentType agentType;

    /**
     * 系统提示词
     */
    private String systemPrompt;

    /**
     * 欢迎信息
     */
    private String welcomeMessage;

    /**
     * 模型配置
     */
    private ModelConfig modelConfig;

    /**
     * 工具列表
     */
    private List<AgentTool> tools;

    /**
     * 关联知识库
     */
    private List<String> knowledgeBaseIds;


    public void validate() {
        ValidationUtils.notEmpty(name, "name");
        ValidationUtils.length(name, 1, 20, "name");

        // 没有设置AgentType，默认聊天类型
        if (agentType == null) {
            agentType = AgentType.CHAT_ASSISTANT;
        }
    }

    public CreateAgentRequest() {
    }

    public CreateAgentRequest(String name, String avatar, String description, AgentType agentType, String systemPrompt, String welcomeMessage, ModelConfig modelConfig, List<AgentTool> tools, List<String> knowledgeBaseIds) {
        this.name = name;
        this.avatar = avatar;
        this.description = description;
        this.agentType = agentType;
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

    public AgentType getAgentType() {
        return agentType;
    }

    public void setAgentType(AgentType agentType) {
        this.agentType = agentType;
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
