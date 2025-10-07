package com.xiaoguai.agentx.domain.tool.service;


import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.domain.tool.model.ToolVersionEntity;
import com.xiaoguai.agentx.domain.tool.repository.ToolVersionRepository;
import org.springframework.stereotype.Service;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 20:35
 * @Description: 工具版本领域服务
 */
@Service
public class ToolVersionDomainService {

    private final ToolVersionRepository toolVersionRepository;

    public ToolVersionDomainService(ToolVersionRepository toolVersionRepository) {
        this.toolVersionRepository = toolVersionRepository;
    }

    public void deleteToolVersion(String toolId, String userId) {
        Wrapper<ToolVersionEntity> wrapper = Wrappers.<ToolVersionEntity>lambdaQuery()
                .eq(ToolVersionEntity::getToolId, toolId)
                .eq(ToolVersionEntity::getUserId, userId);

        toolVersionRepository.delete(wrapper);
    }
}
