package com.xiaoguai.agentx.application.agent.assembler;


import com.xiaoguai.agentx.domain.agent.dto.AgentDTO;
import com.xiaoguai.agentx.domain.agent.dto.AgentVersionDTO;
import com.xiaoguai.agentx.domain.agent.model.ModelConfig;
import com.xiaoguai.agentx.domain.agent.model.AgentEntity;
import com.xiaoguai.agentx.domain.agent.model.AgentVersionEntity;
import com.xiaoguai.agentx.domain.agent.constant.AgentType;
import com.xiaoguai.agentx.interfaces.dto.agent.CreateAgentRequest;
import com.xiaoguai.agentx.interfaces.dto.agent.PublishAgentVersionRequest;
import com.xiaoguai.agentx.interfaces.dto.agent.UpdateAgentRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-30 15:27
 * @Description: Agent组装器
 */
public class AgentAssembler {

    /**
     * 将 CreateAgentRequest转换成 entity
     *
     * @param request controller 请求参数
     */
    public static AgentEntity toEntity(CreateAgentRequest request, String userId) {
        AgentEntity agentEntity = new AgentEntity();
        agentEntity.setName(request.getName());
        agentEntity.setAvatar(request.getAvatar());
        agentEntity.setDescription(request.getDescription());
        agentEntity.setSystemPrompt(request.getSystemPrompt());
        agentEntity.setWelcomeMessage(request.getWelcomeMessage());

        // 设置Agent类型
        AgentType agentType = request.getAgentType();
        agentEntity.setAgentType(agentType.getCode());
        agentEntity.setUserId(userId);

        // 默认启用
        agentEntity.setEnabled(true);

        // 模型配置
        if (request.getModelConfig() == null) {
            // 默认配置
            ModelConfig modelConfig = ModelConfig.createDefault();
            agentEntity.setModelConfig(modelConfig);
        } else {
            agentEntity.setModelConfig(request.getModelConfig());
        }

        // 工具和知识库
        agentEntity.setTools(request.getTools() == null ? new ArrayList<>() : request.getTools());
        agentEntity.setKnowledgeBaseIds(request.getKnowledgeBaseIds() == null ? new ArrayList<>() : request.getKnowledgeBaseIds());

        // 创建时间和更新时间
        LocalDateTime now = LocalDateTime.now();
        agentEntity.setCreatedAt(now);
        agentEntity.setUpdatedAt(now);

        return agentEntity;
    }


    /**
     * 将UpdateAgentRequest转换为AgentEntity
     */
    public static AgentEntity toEntity(UpdateAgentRequest request, String userId) {
        AgentEntity entity = new AgentEntity();
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setAvatar(request.getAvatar());
        entity.setSystemPrompt(request.getSystemPrompt());
        entity.setWelcomeMessage(request.getWelcomeMessage());
        entity.setModelConfig(request.getModelConfig());
        entity.setTools(request.getTools());
        entity.setKnowledgeBaseIds(request.getKnowledgeBaseIds());
        entity.setUserId(userId);

        return entity;
    }


    /**
     * 创建AgentVersionEntity
     */
    public static AgentVersionEntity createVersionEntity(AgentEntity agent, PublishAgentVersionRequest request) {
        return AgentVersionEntity.createFromAgent(agent, request.getVersionNumber(), request.getChangeLog());
    }

    /**
     * 将AgentEntity转换为AgentDTO
     */
    public static AgentDTO toDTO(AgentEntity entity) {
        if (entity == null) {
            return null;
        }

        AgentDTO dto = new AgentDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setAvatar(entity.getAvatar());
        dto.setDescription(entity.getDescription());
        dto.setSystemPrompt(entity.getSystemPrompt());
        dto.setWelcomeMessage(entity.getWelcomeMessage());
        dto.setModelConfig(entity.getModelConfig());
        dto.setTools(entity.getTools());
        dto.setKnowledgeBaseIds(entity.getKnowledgeBaseIds());
        dto.setPublishedVersion(entity.getPublishedVersion());
        dto.setEnabled(entity.getEnabled());
        dto.setAgentType(entity.getAgentType());
        dto.setUserId(entity.getUserId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }

    /**
     * 将AgentVersionEntity转换为AgentVersionDTO
     */
    public static AgentVersionDTO toDTO(AgentVersionEntity entity) {
        if (entity == null) {
            return null;
        }

        AgentVersionDTO dto = new AgentVersionDTO();
        dto.setId(entity.getId());
        dto.setAgentId(entity.getAgentId());
        dto.setVersionNumber(entity.getVersionNumber());
        dto.setSystemPrompt(entity.getSystemPrompt());
        dto.setWelcomeMessage(entity.getWelcomeMessage());
        dto.setModelConfig(entity.getModelConfig());
        dto.setTools(entity.getTools());
        dto.setKnowledgeBaseIds(entity.getKnowledgeBaseIds());
        dto.setChangeLog(entity.getChangeLog());
        dto.setAgentType(entity.getAgentType());
        dto.setPublishedAt(entity.getPublishedAt());

        return dto;
    }

    /**
     * 将AgentEntity列表转换为AgentDTO列表
     */
    public static List<AgentDTO> toDTOList(List<AgentEntity> entities) {
        if (entities == null) {
            return new ArrayList<>();
        }

        List<AgentDTO> dtoList = new ArrayList<>(entities.size());
        for (AgentEntity entity : entities) {
            dtoList.add(toDTO(entity));
        }

        return dtoList;
    }

    /**
     * 将AgentVersionEntity列表转换为AgentVersionDTO列表
     */
    public static List<AgentVersionDTO> toVersionDTOList(List<AgentVersionEntity> entities) {
        if (entities == null) {
            return new ArrayList<>();
        }

        List<AgentVersionDTO> dtoList = new ArrayList<>(entities.size());
        for (AgentVersionEntity entity : entities) {
            dtoList.add(toDTO(entity));
        }

        return dtoList;
    }
}
