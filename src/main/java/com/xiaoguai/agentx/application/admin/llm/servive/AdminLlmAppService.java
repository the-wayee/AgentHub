package com.xiaoguai.agentx.application.admin.llm.servive;


import com.xiaoguai.agentx.application.llm.assembler.ModelAssembler;
import com.xiaoguai.agentx.application.llm.assembler.ProviderAssembler;
import com.xiaoguai.agentx.application.llm.dto.ModelDTO;
import com.xiaoguai.agentx.application.llm.dto.ProviderDTO;
import com.xiaoguai.agentx.domain.llm.model.ModelEntity;
import com.xiaoguai.agentx.domain.llm.model.ProviderAggregate;
import com.xiaoguai.agentx.domain.llm.model.ProviderEntity;
import com.xiaoguai.agentx.domain.llm.model.enums.ProviderType;
import com.xiaoguai.agentx.domain.llm.service.LlmDomainService;
import com.xiaoguai.agentx.infrastrcture.entity.Operator;
import com.xiaoguai.agentx.interfaces.dto.llm.ModelCreateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ModelUpdateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ProviderCreateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ProviderUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-16 09:58
 * @Description: AdminLlmAppService
 */
@Service
public class AdminLlmAppService {

    private final LlmDomainService llmDomainService;

    public AdminLlmAppService(LlmDomainService llmDomainService) {
        this.llmDomainService = llmDomainService;
    }

    /**
     * 创建官方供应商
     */
    @Transactional
    public ProviderDTO createProvider(ProviderCreateRequest request, String userId) {
        ProviderEntity entity = ProviderAssembler.toEntity(request, userId);
        entity.setOfficial(true);
        ProviderEntity provider = llmDomainService.createProvider(entity);
        return ProviderAssembler.toDTO(provider);
    }

    /**
     * 更新官方提供商
     */
    @Transactional
    public ProviderDTO updateProvider(ProviderUpdateRequest request, String userId) {
        ProviderEntity entity = ProviderAssembler.toEntity(request, userId);
        entity.setOfficial(true);
        entity.setAdmin();
        llmDomainService.updateProvider(entity);
        return ProviderAssembler.toDTO(entity);
    }

    /**
     * 删除官方提供商
     */
    @Transactional
    public void deleteProvider(String providerId, String userId) {
        llmDomainService.deleteProvider(providerId, userId, Operator.ADMIN);
    }

    /**
     * 创建官方模型
     */
    @Transactional
    public ModelDTO createModel(ModelCreateRequest request, String userId) {
        ModelEntity model = ModelAssembler.toEntity(request, userId);
        model.setOfficial(true);
        ModelEntity entity = llmDomainService.createModel(model);
        return ModelAssembler.toDTO(entity);
    }


    /**
     * 修改官方模型
     */
    @Transactional
    public void updateModel(ModelUpdateRequest request, String userId) {
        ModelEntity model = ModelAssembler.toEntity(request, userId);
        model.setOfficial(true);
        model.setAdmin();
        llmDomainService.updateModel(model);
    }

    /**
     * 删除官方模型
     */
    @Transactional
    public void deleteModel(String modelId, String userId) {
        llmDomainService.deleteModel(modelId, userId, Operator.ADMIN);
    }

    /**
     * 获取服务商列表
     */
    public List<ProviderAggregate> getProvidersByType(String userId) {
        return llmDomainService.getProvidersByType(ProviderType.OFFICIAL, userId);
    }

    /**
     * 获取服务商的模型列表信息
     */
    public List<ModelDTO> getProviderModels(String providerId, String userId) {
        List<ModelEntity> models = llmDomainService.getProviderModels(providerId);
        return ModelAssembler.toDTOs(models);
    }
}
