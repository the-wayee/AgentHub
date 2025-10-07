package com.xiaoguai.agentx.interfaces.api.portal.tool;


import com.xiaoguai.agentx.application.tool.ToolAppService;
import com.xiaoguai.agentx.application.user.dto.ToolDTO;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.tool.CreateToolRequest;
import com.xiaoguai.agentx.interfaces.dto.tool.UpdateToolRequest;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 20:23
 * @Description: 工具市场接口
 */
@RestController
@RequestMapping("/tools")
public class PortalToolController {

    private final ToolAppService toolAppService;

    public PortalToolController(ToolAppService toolAppService) {
        this.toolAppService = toolAppService;
    }

    /**
     * 上传工具
     */
    @PostMapping
    public Result<ToolDTO> createTools(@RequestBody @Validated CreateToolRequest request) {
        String userId = UserContext.getUserId();
        ToolDTO dto = toolAppService.uploadTool(request, userId);
        return Result.success(dto);
    }

    /**
     * 获取用户工具详情信息
     */
    @GetMapping("/{toolId}")
    public Result<ToolDTO> getToolDetail(@PathVariable String toolId) {
        String userId = UserContext.getUserId();
        ToolDTO dto = toolAppService.getToolDetail(toolId, userId);
        return Result.success(dto);
    }

    /**
     * 获取用户的工具列表
     */
    @GetMapping("/user")
    public Result<List<ToolDTO>> getUserTools() {
        String userId = UserContext.getUserId();
        List<ToolDTO> tools = toolAppService.getUserTools(userId);
        return Result.success(tools);
    }


    /**
     * 更新工具
     */
    @PutMapping("/{toolId}")
    public Result<ToolDTO> updateTool(@PathVariable String toolId, @RequestBody @Validated UpdateToolRequest request) {
        String userId = UserContext.getUserId();
        ToolDTO dto = toolAppService.updateTool(toolId, request, userId);
        return Result.success(dto);
    }

    /**
     * 删除工具
     */
    @DeleteMapping("/{toolId}")
    public Result<?> deleteTool(@PathVariable String toolId) {
        String userId = UserContext.getUserId();
        toolAppService.deleteTool(toolId, userId);
        return Result.success();
    }
}
