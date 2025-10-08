package com.xiaoguai.agentx.interfaces.api.portal.tool;


import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xiaoguai.agentx.application.tool.ToolAppService;
import com.xiaoguai.agentx.application.tool.dto.ToolDTO;
import com.xiaoguai.agentx.application.tool.dto.ToolVersionDTO;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.tool.CreateToolRequest;
import com.xiaoguai.agentx.interfaces.dto.tool.MarketToolRequest;
import com.xiaoguai.agentx.interfaces.dto.tool.QueryToolsRequest;
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

    /**
     * 上架工具
     */
    @PostMapping("/{toolId}/market")
    public Result<?> marketTool(@PathVariable String toolId, @RequestBody @Validated MarketToolRequest request) {
        String userId = UserContext.getUserId();
        toolAppService.marketTool(toolId, request, userId);
        return Result.success().message("工具上架成功");
    }

    /**
     * 获取工具市场的工具
     */
    @GetMapping("/market")
    public Result<IPage<ToolVersionDTO>> getMaretTools(QueryToolsRequest request) {
        return Result.success(toolAppService.getMarketTools(request));
    }

    /**
     * 安装工具
     */
    @GetMapping("/install/{toolId}/{version}")
    public Result<?> installTool(@PathVariable String toolId, @PathVariable String version) {
        String userId = UserContext.getUserId();
        toolAppService.installTool(userId, toolId, version);
        return Result.success().message("安装成功");
    }


    /**
     * 卸载工具
     */
    @DeleteMapping("/uninstall/{toolId}")
    public Result<?> uninstallTool(@PathVariable String toolId) {
        String userId = UserContext.getUserId();
        toolAppService.uninstallTool(userId, toolId);
        return Result.success().message("卸载成功");
    }

    /**
     * 获取已安装的工具
     */
    @GetMapping("/installed")
    public Result<IPage<ToolVersionDTO>> getInstalledTools(QueryToolsRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(toolAppService.getInstalledTools(request, userId));
    }

    /**
     * 获取工具已发布的所有版本
     */
    @GetMapping("/market/{toolId}/versions")
    public Result<List<ToolVersionDTO>> getToolVersions(@PathVariable String toolId) {
        return Result.success(toolAppService.getToolVersions(toolId));
    }

    /**
     * 推荐工具
     */
    @GetMapping("/recommend")
    public Result<List<ToolVersionDTO>> getRecommendTools() {
        return Result.success(toolAppService.getRecommendTools());
    }

}
