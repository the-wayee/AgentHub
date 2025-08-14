package com.xiaoguai.agentx.interfaces.api.portal.llm;


import com.xiaoguai.agentx.application.llm.dto.ModelDTO;
import com.xiaoguai.agentx.application.llm.dto.ProviderDTO;
import com.xiaoguai.agentx.application.llm.service.LlmAppService;
import com.xiaoguai.agentx.domain.llm.model.ProviderAggregate;
import com.xiaoguai.agentx.domain.llm.model.enums.ModelType;
import com.xiaoguai.agentx.domain.llm.model.enums.ProviderType;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.llm.ModelCreateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ModelUpdateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ProviderCreateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ProviderUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 14:43
 * @Description: 大模型服务商控制层
 */
@RestController
@RequestMapping("/llm")
public class PortalLlmController {

    private final LlmAppService llmAppService;

    public PortalLlmController(LlmAppService llmAppService) {
        this.llmAppService = llmAppService;
    }

    /**
     * 创建服务商
     */
    @PostMapping("/providers")
    public Result<ProviderDTO> createProvider(@RequestBody @Valid ProviderCreateRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(llmAppService.createProvider(request, userId));
    }

    /**
     * 更新服务商
     */
    @PutMapping("/providers")
    public Result<ProviderDTO> createProvider(@RequestBody @Valid ProviderUpdateRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(llmAppService.updateProvider(request, userId));
    }

    /**
     * 获取服务商
     */
    @GetMapping("/providers/{providerId}")
    public Result<ProviderDTO> getProvider(@PathVariable String providerId) {
        return Result.success(llmAppService.getProviderById(providerId));
    }

    /**
     * 删除服务商
     */
    @DeleteMapping("/providers/{providerId}")
    public Result<Void> deleteProvider(@PathVariable String providerId) {
        String userId = UserContext.getUserId();
        llmAppService.deleteProvider(providerId, userId);
        return Result.success();
    }

    /**
     * 获取所有供应商协议
     */
    @GetMapping("/providers/protocols")
    public Result<List<ProviderProtocol>> getAllProtocols() {
        return Result.success(llmAppService.getAllProtocols());
    }

    /**
     * 切换服务商状态：启用/禁用
     */
    @PutMapping("/providers/{providerId}/toggle-status")
    public Result<Void> toggleProviderStatus(@PathVariable String providerId) {
        String userId = UserContext.getUserId();
        llmAppService.toggleProviderStatus(providerId, userId);
        return Result.success();
    }

    /**
     * 获取服务商类型下拉列表
     */
    @GetMapping("/providers/types")
    public Result<List<ProviderType>> getProviderTypes() {
        return Result.success(llmAppService.getProviderTypes());
    }

    /**
     * 根据类型获取服务商列表
     */
    @GetMapping("/providers")
    public Result<List<ProviderAggregate>> getProvidersByType(
            @RequestParam(required = false, defaultValue = "all") String type) {
        String userId = UserContext.getUserId();
        return Result.success(llmAppService.getProvidersByType(type, userId));
    }

    /**
     * 获取用户的提供商列表
     */
    @GetMapping("/providers/user")
    public Result<List<ProviderDTO>> getUserProviders() {
        String userId = UserContext.getUserId();
        return Result.success(llmAppService.getUserProviders(userId));
    }


    /**
     * 创建model
     */
    @PostMapping("/models")
    public Result<ModelDTO> createModel(@RequestBody ModelCreateRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(llmAppService.createModel(request, userId));
    }

    /**
     * 修改model
     */
    @PutMapping("/models")
    public Result<ModelDTO> updateModel(@RequestBody ModelUpdateRequest request) {
        String userId = UserContext.getUserId();
        return null;
    }

    /**
     * 获取服务商模型列表
     */
    @GetMapping("/models/{providerId}")
    public Result<List<ModelDTO>> getProviderModels(@PathVariable String providerId) {
        return Result.success(llmAppService.getProviderModels(providerId));
    }


    /**
     * 切换模型状态
     */
    @PutMapping("/models/{modelId}/toggle-status")
    public Result<Void> toggleModelStatus(@PathVariable String modelId) {
        String userId = UserContext.getUserId();
        llmAppService.toggleModelStatus(modelId, userId);
        return Result.success();
    }

    /**
     * 获取模型类型
     */
    @GetMapping("/models/types")
    public Result<List<ModelType>> getModelTypes() {
        return Result.success(llmAppService.getModelTypes());
    }

    /**
     * 获取激活状态的Provider和Model
     */
    @GetMapping("/models/active")
    public Result<List<ProviderAggregate>> getProviderAggregatesActive() {
        String userId = UserContext.getUserId();
        return Result.success(llmAppService.getProviderAggregatesActive(userId));
    }


}
