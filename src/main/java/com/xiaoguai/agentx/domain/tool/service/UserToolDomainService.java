package com.xiaoguai.agentx.domain.tool.service;


import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xiaoguai.agentx.domain.tool.model.UserToolEntity;
import com.xiaoguai.agentx.domain.tool.repository.UserToolRepository;
import com.xiaoguai.agentx.interfaces.dto.tool.QueryToolsRequest;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 20:35
 * @Description: 用户已安装工具服务
 */
@Service
public class UserToolDomainService {

    private final UserToolRepository userToolRepository;

    public UserToolDomainService(UserToolRepository userToolRepository) {
        this.userToolRepository = userToolRepository;
    }


    public Map<String, Long> getToolInstallCount(List<String> toolIds) {
        if (toolIds == null || toolIds.isEmpty()) {
            return Collections.emptyMap();
        }
        LambdaQueryWrapper<UserToolEntity> wrapper = Wrappers.<UserToolEntity>lambdaQuery()
                .in(UserToolEntity::getToolId, toolIds);
        return userToolRepository.selectList(wrapper)
                .stream()
                .collect(Collectors.groupingBy(UserToolEntity::getToolId, Collectors.counting()));
    }

    public UserToolEntity findByToolIdAndUserId(String userId, String toolId) {
        LambdaQueryWrapper<UserToolEntity> wrapper = Wrappers.<UserToolEntity>lambdaQuery()
                .eq(UserToolEntity::getUserId, userId)
                .eq(UserToolEntity::getToolId, toolId);

        return userToolRepository.selectOne(wrapper);
    }

    public void add(UserToolEntity userToolEntity) {
        userToolRepository.checkInsert(userToolEntity);
    }

    public void update(UserToolEntity userToolEntity) {
        userToolRepository.checkUpdateById(userToolEntity);
    }

    public Page<UserToolEntity> listByUserId(String userId, QueryToolsRequest request) {
        LambdaQueryWrapper<UserToolEntity> wrapper = Wrappers.<UserToolEntity>lambdaQuery()
                .eq(UserToolEntity::getUserId, userId)
                .like(StringUtils.isNotBlank(request.getToolName()), UserToolEntity::getName, request.getToolName());
        return userToolRepository.selectPage(new Page<>(request.getCurrent(), request.getSize()), wrapper);
    }

    public void delete(String userId, String toolId) {
        LambdaQueryWrapper<UserToolEntity> wrapper = Wrappers.<UserToolEntity>lambdaQuery()
                .eq(UserToolEntity::getUserId, userId)
                .eq(UserToolEntity::getToolId, toolId);
        userToolRepository.checkDelete(wrapper);
    }
}
