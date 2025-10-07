package com.xiaoguai.agentx.application.tool;


import com.xiaoguai.agentx.application.user.assembler.ToolAssembler;
import com.xiaoguai.agentx.application.user.dto.ToolDTO;
import com.xiaoguai.agentx.domain.tool.model.ToolEntity;
import com.xiaoguai.agentx.domain.tool.service.ToolDomainService;
import com.xiaoguai.agentx.domain.tool.service.ToolVersionDomainService;
import com.xiaoguai.agentx.domain.user.model.UserEntity;
import com.xiaoguai.agentx.domain.user.service.UserDomainService;
import com.xiaoguai.agentx.interfaces.dto.tool.CreateToolRequest;
import com.xiaoguai.agentx.interfaces.dto.tool.UpdateToolRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    public ToolAppService(ToolDomainService toolDomainService, ToolVersionDomainService toolVersionDomainService, UserDomainService userDomainService) {
        this.toolDomainService = toolDomainService;
        this.toolVersionDomainService = toolVersionDomainService;
        this.userDomainService = userDomainService;
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
}
