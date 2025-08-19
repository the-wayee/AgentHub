package com.xiaoguai.agentx.application.llm.assembler;


import com.xiaoguai.agentx.application.llm.dto.ProviderDTO;
import com.xiaoguai.agentx.domain.llm.model.ProviderEntity;
import com.xiaoguai.agentx.domain.llm.model.config.ProviderConfig;
import com.xiaoguai.agentx.interfaces.dto.llm.ProviderCreateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ProviderUpdateRequest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 11:08
 * @Description: 服务提供商组装器
 */
public class ProviderAssembler {
    /**
     * 将实体转换为DTO，并进行敏感信息脱敏
     */
    public static ProviderDTO toDTO(ProviderEntity provider) {
        if (provider == null) {
            return null;
        }

        ProviderDTO dto = new ProviderDTO();
        dto.setId(provider.getId());
        dto.setProtocol(provider.getProtocol());
        dto.setName(provider.getName());
        dto.setDescription(provider.getDescription());
        dto.setConfig(provider.getConfig());
        dto.setOfficial(provider.getOfficial());
        dto.setStatus(provider.getStatus());
        dto.setCreatedAt(provider.getCreatedAt());
        dto.setUpdatedAt(provider.getUpdatedAt());

        // 脱敏处理（针对返回前端的场景）
//        dto.maskSensitiveInfo();

        return dto;
    }

    public static List<ProviderDTO> toDTOs(List<ProviderEntity> providers) {
        if (providers == null || providers.isEmpty()) {
            return Collections.emptyList();
        }
        List<ProviderDTO> dtoList = new ArrayList<>();
        for (ProviderEntity provider : providers) {
            dtoList.add(toDTO(provider));
        }
        return dtoList;
    }


    public static ProviderEntity toEntity(ProviderCreateRequest request, String userId) {
        ProviderEntity provider = new ProviderEntity();
        provider.setProtocol(request.getProtocol());
        provider.setName(request.getName());
        provider.setDescription(request.getDescription());
        provider.setConfig(request.getConfig());
        provider.setUserId(userId);
        provider.setStatus(request.getStatus());
        return provider;
    }

    public static ProviderEntity toEntity(ProviderUpdateRequest request, String userId) {
        ProviderEntity provider = new ProviderEntity();
        provider.setId(request.getId());
        provider.setUserId(userId);
        provider.setProtocol(request.getProtocol());
        provider.setName(request.getName());
        provider.setDescription(request.getDescription());
        // TODO config 的 apikey前端是加密状态
        provider.setConfig(request.getConfig());
        provider.setStatus(request.getStatus());

        return provider;
    }
}
