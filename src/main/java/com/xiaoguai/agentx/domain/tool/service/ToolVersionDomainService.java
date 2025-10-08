package com.xiaoguai.agentx.domain.tool.service;


import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xiaoguai.agentx.domain.tool.model.ToolVersionEntity;
import com.xiaoguai.agentx.domain.tool.repository.ToolVersionRepository;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.interfaces.dto.tool.QueryToolsRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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

    /**
     * 获取工具最新版本
     */
    public ToolVersionEntity findLatestToolVersion(String toolId, String userId) {
        LambdaQueryWrapper<ToolVersionEntity> wrapper = Wrappers.<ToolVersionEntity>lambdaQuery()
                .eq(ToolVersionEntity::getToolId, toolId)
                .eq(ToolVersionEntity::getUserId, userId);

        // 第一次发布时，版本为空
        return toolVersionRepository.selectOne(wrapper);
    }

    public void createToolVersion(ToolVersionEntity toolVersionEntity) {
        toolVersionRepository.insert(toolVersionEntity);
    }

    public IPage<ToolVersionEntity> listToolVersions(QueryToolsRequest request) {
        String toolName = request.getToolName();
        long current = request.getCurrent();
        long size = request.getSize();

        // 查询所有的工具版本
        LambdaQueryWrapper<ToolVersionEntity> wrapper = Wrappers.<ToolVersionEntity>lambdaQuery()
                .like(StringUtils.isNotBlank(toolName), ToolVersionEntity::getName, toolName);
        List<ToolVersionEntity> toolVersionList = toolVersionRepository.selectList(wrapper);

        // 根据toolId 进行映射， 并且create_at更大的
        Map<String, ToolVersionEntity> toolVersionMap = toolVersionList.stream()
                .collect(Collectors.toMap(ToolVersionEntity::getToolId, Function.identity(), (v1, v2) -> v1.getCreatedAt().isAfter(v2.getCreatedAt()) ? v1 : v2));

        List<ToolVersionEntity> toolVersions = new ArrayList<>(toolVersionMap.values());

        // 手动分页
        int fromIndex = (int) ((current - 1) * size);
        int endIndex = (int) (fromIndex + size);
        int toIndex = Math.min(endIndex, toolVersions.size());

        List<ToolVersionEntity> result = fromIndex >= toolVersions.size() ? new ArrayList<>() : toolVersions.subList(fromIndex, toIndex);
        IPage<ToolVersionEntity> pageRes = new Page<ToolVersionEntity>(current, size, toolVersions.size());
        pageRes.setRecords(result);
        return pageRes;
    }

    public ToolVersionEntity getToolVersion(String toolId, String version) {
        LambdaQueryWrapper<ToolVersionEntity> wrapper = Wrappers.<ToolVersionEntity>lambdaQuery()
                .eq(ToolVersionEntity::getToolId, toolId)
                .eq(ToolVersionEntity::getVersion, version);
        ToolVersionEntity toolVersionEntity = toolVersionRepository.selectOne(wrapper);
        if (toolVersionEntity == null) {
            throw new BusinessException("工具版本不存在: " + toolId + " " + version);
        }
        return toolVersionEntity;
    }

    public List<ToolVersionEntity> getToolVersions(String toolId) {
        LambdaQueryWrapper<ToolVersionEntity> wrapper = Wrappers.<ToolVersionEntity>lambdaQuery()
                .eq(ToolVersionEntity::getToolId, toolId)
                .orderByDesc(ToolVersionEntity::getCreatedAt);
        return toolVersionRepository.selectList(wrapper);

    }
}
