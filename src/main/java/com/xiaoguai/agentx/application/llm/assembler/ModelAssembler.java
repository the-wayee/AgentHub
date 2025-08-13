package com.xiaoguai.agentx.application.llm.assembler;


import com.xiaoguai.agentx.application.llm.dto.ModelDTO;
import com.xiaoguai.agentx.domain.llm.model.ModelEntity;
import com.xiaoguai.agentx.interfaces.dto.llm.ModelCreateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ModelUpdateRequest;

import java.time.LocalDateTime;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 10:56
 * @Description: 模型组装器
 */
public class ModelAssembler {

    /**
     * 转换DTO
     */
    public static ModelDTO toDTO(ModelEntity model) {
        if (model == null) {
            return null;
        }

        ModelDTO dto = new ModelDTO();
        dto.setId(model.getId());
        dto.setUserId(model.getUserId());
        dto.setProviderId(model.getProviderId());
        dto.setModelId(model.getModelId());
        dto.setName(model.getName());
        dto.setDescription(model.getDescription());
        dto.setType(model.getType());
        dto.setConfig(model.getConfig());
        dto.setStatus(model.getStatus());
        dto.setCreatedAt(model.getCreatedAt());
        dto.setUpdatedAt(model.getUpdatedAt());
        dto.setOfficial(model.getOfficial());
        return dto;
    }

    /**
     * 将创建请求转换为领域对象
     */
    public static ModelEntity toEntity(ModelCreateRequest request, String userId) {
        ModelEntity model = new ModelEntity();
        model.setUserId(userId);
        model.setProviderId(request.getProviderId());
        model.setModelId(request.getModelId());
        model.setName(request.getName());
        model.setDescription(request.getDescription());
        model.setType(request.getModelType());
        model.setConfig(request.getModelConfig());
        model.setCreatedAt(LocalDateTime.now());
        model.setUpdatedAt(LocalDateTime.now());

        return model;
    }


    public static ModelEntity toEntity(ModelUpdateRequest request, String userId) {
        ModelEntity model = new ModelEntity();
        model.setUserId(userId);
        model.setName(request.getName());
        model.setDescription(request.getDescription());
        model.setModelId(request.getModelId());
        model.setConfig(request.getConfig());
        model.setCreatedAt(LocalDateTime.now());
        model.setUpdatedAt(LocalDateTime.now());
        model.setId(request.getId());

        return model;
    }
}
