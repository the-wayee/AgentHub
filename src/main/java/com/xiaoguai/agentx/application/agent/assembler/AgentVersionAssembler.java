package com.xiaoguai.agentx.application.agent.assembler;


import com.xiaoguai.agentx.application.agent.dto.AgentVersionDTO;
import com.xiaoguai.agentx.domain.agent.model.AgentEntity;
import com.xiaoguai.agentx.domain.agent.model.AgentVersionEntity;
import com.xiaoguai.agentx.interfaces.dto.agent.PublishAgentVersionRequest;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-02 16:47
 * @Description: AgentVersion组装器
 */
public class AgentVersionAssembler {

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

    /**
     * 将AgentVersionEntity转换为AgentVersionDTO
     */
    public static AgentVersionDTO toDTO(AgentVersionEntity entity) {
        if (entity == null) {
            return null;
        }

        AgentVersionDTO dto = new AgentVersionDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setAvatar(entity.getAvatar());
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
        dto.setPublishStatus(entity.getPublishStatus());

        return dto;
    }


    /**
     * 创建AgentVersionEntity
     */
    public static AgentVersionEntity createVersionEntity(AgentEntity agent, PublishAgentVersionRequest request) {
        return AgentVersionEntity.createFromAgent(agent, request.getVersionNumber(), request.getChangeLog());
    }
}
