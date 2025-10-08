package com.xiaoguai.agentx.application.tool;


import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xiaoguai.agentx.application.tool.assembler.ToolAssembler;
import com.xiaoguai.agentx.application.tool.dto.ToolDTO;
import com.xiaoguai.agentx.application.tool.dto.ToolVersionDTO;
import com.xiaoguai.agentx.domain.tool.model.ToolEntity;
import com.xiaoguai.agentx.domain.tool.model.ToolVersionEntity;
import com.xiaoguai.agentx.domain.tool.model.UserToolEntity;
import com.xiaoguai.agentx.domain.tool.service.ToolDomainService;
import com.xiaoguai.agentx.domain.tool.service.ToolVersionDomainService;
import com.xiaoguai.agentx.domain.tool.service.UserToolDomainService;
import com.xiaoguai.agentx.domain.user.model.UserEntity;
import com.xiaoguai.agentx.domain.user.service.UserDomainService;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.exception.ParamValidationException;
import com.xiaoguai.agentx.interfaces.dto.tool.CreateToolRequest;
import com.xiaoguai.agentx.interfaces.dto.tool.MarketToolRequest;
import com.xiaoguai.agentx.interfaces.dto.tool.QueryToolsRequest;
import com.xiaoguai.agentx.interfaces.dto.tool.UpdateToolRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static com.xiaoguai.agentx.domain.tool.constants.ToolStatus.APPROVED;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 20:34
 * @Description: 工具应用服务
 */
@Service
public class ToolAppService {

    private final ToolDomainService toolDomainService;
    private final ToolVersionDomainService toolVersionDomainService;
    private final UserDomainService userDomainService;
    private final UserToolDomainService userToolDomainService;

    public ToolAppService(ToolDomainService toolDomainService, ToolVersionDomainService toolVersionDomainService, UserDomainService userDomainService, UserToolDomainService userToolDomainService) {
        this.toolDomainService = toolDomainService;
        this.toolVersionDomainService = toolVersionDomainService;
        this.userDomainService = userDomainService;
        this.userToolDomainService = userToolDomainService;
    }

    /**
     * 上传工具
     */
    @Transactional(rollbackFor = Exception.class)
    public ToolDTO uploadTool(CreateToolRequest request, String userId) {
        ToolEntity entity = ToolAssembler.toEntity(request, userId);
        entity.setOffice(false);

        // 创建工具
        ToolEntity createTool = toolDomainService.createTool(entity);

        // 返回DTO
        return ToolAssembler.toDTO(createTool, null);
    }

    /**
     * 获取用户工具详情信息
     */
    public ToolDTO getToolDetail(String toolId, String userId) {
        ToolEntity entity = toolDomainService.detail(toolId, userId);
        UserEntity user = userDomainService.getUserById(userId);
        return ToolAssembler.toDTO(entity, user.getNickname());
    }

    /**
     * 获取用户工具列表
     */
    public List<ToolDTO> getUserTools(String userId) {
        List<ToolEntity> tools = toolDomainService.getUserTools(userId);
        UserEntity user = userDomainService.getUserById(userId);
        return ToolAssembler.toDTO(tools, user.getNickname());
    }

    /**
     * 更新工具
     */
    public ToolDTO updateTool(String toolId, UpdateToolRequest request, String userId) {
        ToolEntity entity = ToolAssembler.toolEntity(request, userId);
        entity.setId(toolId);
        ToolEntity updateTool = toolDomainService.updateTool(entity);
        return ToolAssembler.toDTO(updateTool, null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteTool(String toolId, String userId) {
        toolDomainService.deleteTool(toolId, userId);
        toolVersionDomainService.deleteToolVersion(toolId, userId);
    }


    @Transactional(rollbackFor = Exception.class)
    public void marketTool(String toolId, MarketToolRequest request, String userId) {
        ToolEntity tool = toolDomainService.getTool(toolId, userId);
        if (!APPROVED.equals(tool.getStatus())) {
            throw new BusinessException("工具未通过审核，无法上架");
        }
        // 检查版本号格式
        request.checkVersionValid();
        ToolVersionEntity latestToolVersion = toolVersionDomainService.findLatestToolVersion(toolId, userId);
        // 不是第一次发布，需要判断版本号
        if (latestToolVersion != null) {
            if (!request.isVersionGreaterThan(latestToolVersion.getVersion())) {
                throw new ParamValidationException("versionNumber",
                        "新版本号(" + request.getVersion() + ")必须大于当前最新版本号(" + latestToolVersion.getVersion() + ")");
            }
        }

        ToolVersionEntity toolVersionEntity = new ToolVersionEntity();
        BeanUtils.copyProperties(tool, toolVersionEntity);
        toolVersionEntity.setVersion(request.getVersion());
        toolVersionEntity.setChangeLog(request.getChangeLog());
        toolVersionEntity.setToolId(toolId);
        toolVersionEntity.setPublicStatus(true);
        toolVersionEntity.setId(null);

        toolVersionDomainService.createToolVersion(toolVersionEntity);

    }

    public IPage<ToolVersionDTO> getMarketTools(QueryToolsRequest request) {
        IPage<ToolVersionEntity> toolVersionEntityIPage = toolVersionDomainService.listToolVersions(request);
        List<ToolVersionEntity> toolVersions = toolVersionEntityIPage.getRecords();

        // 获取安装数量
        Map<String, Long> toolInstallCountMap = userToolDomainService.getToolInstallCount(toolVersions.stream().map(ToolVersionEntity::getToolId).toList());

        // 获取用户信息
        Map<String, UserEntity> users = userDomainService.getUsers(toolVersions.stream().map(ToolVersionEntity::getUserId).toList());

        List<ToolVersionDTO> dtos = new ArrayList<>();
        toolVersions.forEach(toolVersion -> {
            ToolVersionDTO dto = ToolAssembler.toDTO(toolVersion);
            dto.setUserName(users.get(toolVersion.getUserId()).getNickname());
            dto.setInstallCount(toolInstallCountMap.get(toolVersion.getToolId()));

            dtos.add(dto);
        });

        IPage<ToolVersionDTO> page = new Page<>(request.getCurrent(), request.getSize(), toolVersionEntityIPage.getTotal());
        page.setRecords(dtos);
        return page;
    }

    @Transactional(rollbackFor = Exception.class)
    public void installTool(String userId, String toolId, String version) {
        UserToolEntity userToolEntity = userToolDomainService.findByToolIdAndUserId(userId, toolId);
        ToolVersionEntity toolVersionEntity = toolVersionDomainService.getToolVersion(toolId, version);

        if (userToolEntity == null) {
            userToolEntity = new UserToolEntity();
            userToolEntity.setToolId(toolId);
            userToolEntity.setUserId(userId);
            userToolEntity.setVersion(version);
        }
        String userToolId = userToolEntity.getId();
        BeanUtils.copyProperties(toolVersionEntity, userToolEntity);
        userToolEntity.setId(userToolId);

        if (userToolId == null) {
            userToolDomainService.add(userToolEntity);
        } else {
            userToolDomainService.update(userToolEntity);
        }

    }

    public IPage<ToolVersionDTO> getInstalledTools(QueryToolsRequest request, String userId) {
        Page<UserToolEntity> userToolEntityPage = userToolDomainService.listByUserId(userId, request);
        List<ToolVersionDTO> versionDTOS = userToolEntityPage.getRecords()
                .stream()
                .map(each -> {
                    ToolVersionDTO dto = ToolAssembler.toDTO(each);
                    dto.setUserName(userDomainService.getUserById(each.getUserId()).getNickname());
                    return dto;
                }).toList();
        IPage<ToolVersionDTO> page = new Page<>(request.getCurrent(), request.getSize(), versionDTOS.size());
        page.setRecords(versionDTOS);
        return page;
    }

    public List<ToolVersionDTO> getRecommendTools() {
        QueryToolsRequest queryToolRequest = new QueryToolsRequest();
        queryToolRequest.setCurrent(1);
        queryToolRequest.setSize(Integer.MAX_VALUE);
        IPage<ToolVersionEntity> listToolVersion = toolVersionDomainService.listToolVersions(queryToolRequest);
        List<ToolVersionEntity> records = listToolVersion.getRecords();

        Map<String, Long> toolsInstallMap = userToolDomainService
                .getToolInstallCount(records.stream().map(ToolVersionEntity::getToolId).toList());

        List<ToolVersionDTO> toolVersionDTOs = records.stream().map(toolVersionEntity -> {
            ToolVersionDTO dto = ToolAssembler.toDTO(toolVersionEntity);
            dto.setInstallCount(toolsInstallMap.get(dto.getToolId()));
            return dto;
        }).toList();

        if (records.size() > 10) {
            // 使用随机数从所有记录中选取10条不重复的记录
            Random random = new Random();
            toolVersionDTOs = toolVersionDTOs.stream().sorted((a, b) -> random.nextInt(2) - 1).limit(10).toList();
        }

        return toolVersionDTOs;
    }

    public void uninstallTool(String userId, String toolId) {
        userToolDomainService.delete(userId, toolId);
    }

    public List<ToolVersionDTO> getToolVersions(String toolId) {
        List<ToolVersionEntity> toolVersions = toolVersionDomainService.getToolVersions(toolId);
        return toolVersions.stream().map(ToolAssembler::toDTO).toList();
    }
}
