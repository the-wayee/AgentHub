package com.xiaoguai.agentx.application.agent.dto;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-02 15:43
 * @Description: AgentWorkspaceDTO
 */
public class AgentWorkspaceDTO {

    private String agentId;

    private String userId;

    private String modelId;

    public String getModelId() {
        return modelId;
    }

    public void setModelId(String modelId) {
        this.modelId = modelId;
    }

    public AgentWorkspaceDTO(String agentId, String userId) {
        this.agentId = agentId;
        this.userId = userId;
    }

    public String getAgentId() {
        return agentId;
    }

    public void setAgentId(String agentId) {
        this.agentId = agentId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
