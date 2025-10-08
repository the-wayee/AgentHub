package com.xiaoguai.agentx.domain.tool.service;


import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.domain.tool.constants.ToolStatus;
import com.xiaoguai.agentx.domain.tool.model.ToolEntity;
import com.xiaoguai.agentx.domain.tool.repository.ToolRepository;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 20:34
 * @Description: 工具领域服务
 */
@Service
public class ToolDomainService {

    private final ToolRepository toolRepository;

    public ToolDomainService(ToolRepository toolRepository) {
        this.toolRepository = toolRepository;
    }

    /**
     * 创建工具
     */
    public ToolEntity createTool(ToolEntity entity) {
        // 设置初始状态
        entity.setStatus(ToolStatus.WAITING_REVIEW);

        // 保存工具
        toolRepository.checkInsert(entity);

        // TODO 进行任务流转

        return entity;

    }

    /**
     * 获取用户工具详情
     */
    public ToolEntity detail(String toolId, String userId) {
        LambdaQueryWrapper<ToolEntity> wrapper = Wrappers.<ToolEntity>lambdaQuery()
                .eq(ToolEntity::getId, toolId)
                .eq(ToolEntity::getUserId, userId);
        ToolEntity entity = toolRepository.selectOne(wrapper);
        if (entity == null) {
            throw new BusinessException("工具不存在: " + toolId);
        }
        return entity;
    }

    public List<ToolEntity> getUserTools(String userId) {
        LambdaQueryWrapper<ToolEntity> wrapper = Wrappers.<ToolEntity>lambdaQuery()
                .eq(ToolEntity::getUserId, userId);

        return toolRepository.selectList(wrapper);

    }

    public ToolEntity updateTool(ToolEntity entity) {
        ToolEntity oldTool = toolRepository.selectById(entity.getId());
        if (oldTool == null) {
            throw new BusinessException("工具不存在:" + entity.getId());
        }

        // 检查是否修改了URL或安装命令
        boolean needStateTransition = false;
        if ((entity.getUploadUrl() != null && !entity.getUploadUrl().equals(oldTool.getUploadUrl()))
                || (entity.getInstallCommand() != null
                && !entity.getInstallCommand().equals(oldTool.getInstallCommand()))) {
            needStateTransition = true;
            entity.setStatus(ToolStatus.WAITING_REVIEW);
        } else {
            // 只修改了信息，设置为人工审核状态
            entity.setStatus(ToolStatus.MANUAL_REVIEW);
        }
        // 更新工具
        LambdaUpdateWrapper<ToolEntity> wrapper = Wrappers.<ToolEntity>lambdaUpdate()
                .eq(ToolEntity::getId, entity.getId())
                .eq(entity.needCheckUserId(), ToolEntity::getUserId, entity.getUserId());
        toolRepository.update(entity, wrapper);

        // TODO 如果需要状态流转，提交到状态流转服务
        if (needStateTransition) {

        }
        return entity;
    }

    public void deleteTool(String toolId, String userId) {
        Wrapper<ToolEntity> wrapper = Wrappers.<ToolEntity>lambdaQuery()
                .eq(ToolEntity::getId, toolId)
                .eq(ToolEntity::getUserId, userId);
        toolRepository.checkDelete(wrapper);
    }

    public ToolEntity getTool(String toolId, String userId) {
        LambdaQueryWrapper<ToolEntity> wrapper = Wrappers.<ToolEntity>lambdaQuery()
                .eq(ToolEntity::getId, toolId)
                .eq(ToolEntity::getUserId, userId);

        ToolEntity entity = toolRepository.selectOne(wrapper);
        if (entity == null) {
            throw new BusinessException("工具不存在：" + toolId);
        }
        return entity;
    }
}
