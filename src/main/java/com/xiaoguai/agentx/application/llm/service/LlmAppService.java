package com.xiaoguai.agentx.application.llm.service;


import com.xiaoguai.agentx.application.llm.assembler.ModelAssembler;
import com.xiaoguai.agentx.application.llm.assembler.ProviderAssembler;
import com.xiaoguai.agentx.application.llm.dto.ModelDTO;
import com.xiaoguai.agentx.application.llm.dto.ProviderDTO;
import com.xiaoguai.agentx.domain.llm.model.ModelEntity;
import com.xiaoguai.agentx.domain.llm.model.ProviderAggregate;
import com.xiaoguai.agentx.domain.llm.model.ProviderEntity;
import com.xiaoguai.agentx.domain.llm.model.enums.ModelType;
import com.xiaoguai.agentx.domain.llm.model.enums.ProviderType;
import com.xiaoguai.agentx.domain.llm.service.LlmDomainService;
import com.xiaoguai.agentx.infrastrcture.entity.Operator;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
import com.xiaoguai.agentx.interfaces.dto.llm.ModelCreateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ProviderCreateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ProviderUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 11:45
 * @Description: Llm应用服务，负责处理 提供商 和 模型
 */
@Service
public class LlmAppService {

    private final LlmDomainService llmDomainService;

    public LlmAppService(LlmDomainService llmDomainService) {
        this.llmDomainService = llmDomainService;
    }

    /**
     * 创建服务商
     */
    @Transactional
    public ProviderDTO createProvider(ProviderCreateRequest request, String userId) {
        // 转换 entity
        ProviderEntity provider = ProviderAssembler.toEntity(request, userId);
        provider.setOfficial(false);
        llmDomainService.createProvider(provider);
        return ProviderAssembler.toDTO(provider);
    }

    /**
     * 更新服务商
     */
    @Transactional
    public ProviderDTO updateProvider(ProviderUpdateRequest request, String userId) {
        // 转换 entity
        ProviderEntity provider = ProviderAssembler.toEntity(request, userId);
        llmDomainService.updateProvider(provider);
        return ProviderAssembler.toDTO(provider);
    }

    /**
     * 删除服务商
     */
    @Transactional
    public void deleteProvider(String providerId, String userId) {
        llmDomainService.deleteProvider(providerId, userId, Operator.USER);
    }


    /**
     * 根据Id获取服务商信息
     */
    public ProviderDTO getProviderById(String providerId) {
        ProviderEntity provider = llmDomainService.getProviderById(providerId);
        return ProviderAssembler.toDTO(provider);
    }

    /**
     * 获取所有供应商协议
     */
    public List<ProviderProtocol> getAllProtocols() {
        return List.of(ProviderProtocol.values());
    }

    /**
     * 根据类型获取供应商列表
     */
    public List<ProviderAggregate> getProvidersByType(String type, String userId) {
        ProviderType providerType = ProviderType.fromCode(type);
        return llmDomainService.getProvidersByType(providerType, userId);
    }

    /**
     * 获取激活状态的Provider和Model列表
     */
    public List<ProviderAggregate> getProviderAggregatesActive(String userId) {
        return llmDomainService.getProviderAggregatesActive(userId);
    }

    /**
     * 切换服务商状态
     */
    public void toggleProviderStatus(String providerId, String userId) {
        llmDomainService.toggleProviderStatus(providerId, userId);
    }

    /**
     * 获取用户的提供商列表
     */
    public List<ProviderDTO> getUserProviders(String userId) {
        List<ProviderEntity> userProviders = llmDomainService.getUserProviders(userId);
        return ProviderAssembler.toDTOs(userProviders);
    }

    /**
     * 获取服务商类型列表
     */
    public List<ProviderType> getProviderTypes() {
        return List.of(ProviderType.values());
    }

    /**
     * 创建模型
     */
    public ModelDTO createModel(ModelCreateRequest request, String userId) {
        ModelEntity entity = ModelAssembler.toEntity(request, userId);

        ModelEntity model = llmDomainService.createModel(entity);

        return ModelAssembler.toDTO(model);
    }

    /**
     * 切换模型状态
     */
    public void toggleModelStatus(String modelId, String userId) {
        llmDomainService.toggleModelStatus(modelId, userId);
    }


    /**
     * 获取模型类型列表
     */
    public List<ModelType> getModelTypes() {
        return List.of(ModelType.values());
    }
}
