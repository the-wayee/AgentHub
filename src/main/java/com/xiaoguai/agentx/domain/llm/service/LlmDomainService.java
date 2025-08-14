package com.xiaoguai.agentx.domain.llm.service;


import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.domain.llm.model.ModelEntity;
import com.xiaoguai.agentx.domain.llm.model.ProviderAggregate;
import com.xiaoguai.agentx.domain.llm.model.ProviderEntity;
import com.xiaoguai.agentx.domain.llm.model.enums.ProviderType;
import com.xiaoguai.agentx.domain.llm.repository.ModelRepository;
import com.xiaoguai.agentx.domain.llm.repository.ProviderRepository;
import com.xiaoguai.agentx.infrastrcture.entity.Operator;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 10:46
 * @Description: Llm领域服务
 */
@Service
public class LlmDomainService {

    private final ModelRepository modelRepository;

    private final ProviderRepository providerRepository;

    public LlmDomainService(ModelRepository modelRepository, ProviderRepository providerRepository) {
        this.modelRepository = modelRepository;
        this.providerRepository = providerRepository;
    }

    /**
     * 创建提供商
     */
    public ProviderEntity createProvider(ProviderEntity provider) {
        providerRepository.insert(provider);
        return provider;
    }

    /**
     * 更新提供商
     */
    public void updateProvider(ProviderEntity provider) {
        LambdaUpdateWrapper<ProviderEntity> wrapper = Wrappers.<ProviderEntity>lambdaUpdate()
                .eq(ProviderEntity::getId, provider.getId())
                .eq(provider.needCheckUserId(), ProviderEntity::getUserId, provider.getUserId());
        providerRepository.checkUpdate(provider, wrapper);
    }

    /**
     * 删除提供商
     */
    public void deleteProvider(String providerId, String userId, Operator operator) {
        // 删除provider
        LambdaQueryWrapper<ProviderEntity> wrapper = Wrappers.<ProviderEntity>lambdaQuery()
                .eq(ProviderEntity::getId, providerId)
                .eq(operator.needCheckUserId(), ProviderEntity::getUserId, userId);
        providerRepository.checkDelete(wrapper);

        // 删除provider下的模型
        LambdaQueryWrapper<ModelEntity> modelWrapper = Wrappers.<ModelEntity>lambdaQuery()
                .eq(ModelEntity::getProviderId, providerId);
        modelRepository.delete(modelWrapper);
    }

    /**
     * 获取所有的提供商
     */
    public List<ProviderAggregate> getAllProviders(String userId) {
        Wrapper<ProviderEntity> wrapper = Wrappers.<ProviderEntity>lambdaQuery()
                .eq(ProviderEntity::getUserId, userId)
                .or()
                .eq(ProviderEntity::getOfficial, true);

        List<ProviderEntity> providers = providerRepository.selectList(wrapper);
        return buildProviderAggregate(providers);
    }

    /**
     * 根据id获取供应商
     */
    public ProviderEntity getProviderById(String id) {
        ProviderEntity provider = providerRepository.selectById(id);
        if (provider == null) {
            throw new BusinessException("供应商不存在: " + id);
        }
        return provider;
    }

    /**
     * 根据类型获取供应商聚合根列表
     */
    public List<ProviderAggregate> getProvidersByType(ProviderType providerType, String userId) {
        LambdaQueryWrapper<ProviderEntity> wrapper = Wrappers.<ProviderEntity>lambdaQuery();
        switch (providerType) {

            case OFFICIAL -> {
                wrapper.eq(ProviderEntity::getOfficial, true);
            }
            case CUSTOM -> {
                wrapper.eq(ProviderEntity::getUserId, userId);
            }
            default -> {
                wrapper.eq(ProviderEntity::getOfficial, true)
                        .or()
                        .eq(ProviderEntity::getUserId, userId);
            }
        }
        List<ProviderEntity> providers = providerRepository.selectList(wrapper);
        return buildProviderAggregate(providers);
    }

    /**
     * 获取激活状态的Provider和Model列表
     */
    public List<ProviderAggregate> getProviderAggregatesActive(String userId) {
        LambdaQueryWrapper<ProviderEntity> wrapper = Wrappers.<ProviderEntity>lambdaQuery()
                .eq(ProviderEntity::getOfficial, true)
                .or()
                .eq(ProviderEntity::getUserId, userId);
        List<ProviderEntity> providers = providerRepository.selectList(wrapper);
        return buildProviderAggregate(providers);
    }


    /**
     * 切换服务商状态
     */
    public void toggleProviderStatus(String providerId, String userId) {
        LambdaUpdateWrapper<ProviderEntity> wrapper = Wrappers.<ProviderEntity>lambdaUpdate()
                .eq(ProviderEntity::getId, providerId)
                .eq(ProviderEntity::getUserId, userId)
                .setSql("status = not status");
        providerRepository.checkUpdate(wrapper);
    }


    /**
     * 获取用户的提供商列表
     */
    public List<ProviderEntity> getUserProviders(String userId) {
        LambdaQueryWrapper<ProviderEntity> wrapper = Wrappers.<ProviderEntity>lambdaQuery()
                .eq(ProviderEntity::getUserId, userId)
                .eq(ProviderEntity::getStatus, true);
        return providerRepository.selectList(wrapper);
    }


    /**
     * 创建模型
     */
    public ModelEntity createModel(ModelEntity model) {
        modelRepository.insert(model);
        return model;
    }

    /**
     * 根据id获取模型
     */
    public ModelEntity getModelById(String id) {
        ModelEntity model = modelRepository.selectById(id);
        if (model == null) {
            throw new BusinessException("模型不存在: " + id);
        }
        return model;
    }

    /**
     * 切换模型状态
     */
    public void toggleModelStatus(String modelId, String userId) {
        LambdaUpdateWrapper<ModelEntity> wrapper = Wrappers.<ModelEntity>lambdaUpdate()
                .eq(ModelEntity::getId, modelId)
                .eq(ModelEntity::getUserId, userId)
                .setSql("status = not status");
        modelRepository.checkUpdate(wrapper);
    }

    /**
     * 获取提供商模型列表
     */
    public List<ModelEntity> getProviderModels(String providerId) {
        return modelRepository.selectList(Wrappers.<ModelEntity>lambdaQuery()
                .eq(ModelEntity::getProviderId, providerId));
    }

    /**
     * 构建服务商和模型的聚合根
     */
    private List<ProviderAggregate> buildProviderAggregate(List<ProviderEntity> providers) {
        if (providers == null || providers.isEmpty()) {
            return Collections.emptyList();
        }

        // 收集provider 的ids
        List<String> providerIds = providers.stream()
                .map(ProviderEntity::getId)
                .toList();

        // 获取响应的model
        List<ModelEntity> models = modelRepository.selectList(Wrappers.<ModelEntity>lambdaQuery()
                .in(ModelEntity::getProviderId, providerIds));

        // 分组 Map
        // key -> providerId
        // value -> List
        Map<String, List<ModelEntity>> modelMap = models.stream()
                .collect(Collectors.groupingBy(ModelEntity::getProviderId));

        // 映射提供商
        Map<String, ProviderEntity> providerMap = providers.stream()
                .sorted(Comparator.comparing(ProviderEntity::getOfficial).reversed())
                .collect(Collectors.toMap(ProviderEntity::getId, Function.identity(), (e1, e2) -> e1, LinkedHashMap::new));

        List<ProviderAggregate> aggregates = new ArrayList<>();
        providerMap.forEach((providerId, provider) -> {
            List<ModelEntity> modelList = modelMap.get(providerId);
            ProviderAggregate aggregate = new ProviderAggregate(provider, modelList);
            aggregates.add(aggregate);
        });

        return aggregates;
    }


    /**
     * 判断服务商是否存在
     */
    private void checkProviderExists(String providerId) {
        boolean exists = providerRepository.exists(Wrappers.<ProviderEntity>lambdaQuery().eq(ProviderEntity::getId, providerId));
        if (!exists) {
            throw new BusinessException("该服务商不存在");
        }
    }

}
