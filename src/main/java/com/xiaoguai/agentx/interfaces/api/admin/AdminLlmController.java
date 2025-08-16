package com.xiaoguai.agentx.interfaces.api.admin;


import com.xiaoguai.agentx.application.admin.llm.servive.AdminLlmAppService;
import com.xiaoguai.agentx.application.llm.dto.ModelDTO;
import com.xiaoguai.agentx.application.llm.dto.ProviderDTO;
import com.xiaoguai.agentx.application.llm.service.LlmAppService;
import com.xiaoguai.agentx.domain.llm.model.ProviderAggregate;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.llm.ModelCreateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ModelUpdateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ProviderCreateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ProviderUpdateRequest;
import jakarta.validation.Valid;
import org.apache.catalina.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-16 09:53
 * @Description: 后台LLm管理
 */
@RestController
@RequestMapping("/admin/llm")
public class AdminLlmController {

    private final AdminLlmAppService adminLlmAppService;

    public AdminLlmController(AdminLlmAppService adminLlmAppService) {
        this.adminLlmAppService = adminLlmAppService;
    }

    /**
     * 创建官方供应商
     */
    @PostMapping("/providers")
    public Result<ProviderDTO> createProvider(@RequestBody @Valid ProviderCreateRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(adminLlmAppService.createProvider(request, userId));
    }

    /**
     * 更新官方供应商
     */
    @PutMapping("/providers")
    public Result<ProviderDTO> updateProvider(@RequestBody @Valid ProviderUpdateRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(adminLlmAppService.updateProvider(request, userId));
    }

    /**
     * 删除官方供应商
     */
    @DeleteMapping("/providers/{providerId}")
    public Result<Void> deleteProvider(@PathVariable String providerId) {
        String userId = UserContext.getUserId();
        adminLlmAppService.deleteProvider(providerId, userId);
        return Result.success();
    }

    /**
     * 获取服务商列表
     */
    @GetMapping("/providers")
    public Result<List<ProviderAggregate>> getProvidersByType() {
        String userId = UserContext.getUserId();
        return Result.success(adminLlmAppService.getProvidersByType(userId));
    }


    /**
     * 创建模型
     */
    @PostMapping("/models")
    public Result<ModelDTO> createModel(@RequestBody @Valid ModelCreateRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(adminLlmAppService.createModel(request, userId));
    }
    /**
     * 修改官方模型
     */
    @PutMapping("/models")
    public Result<Void> updateModel(@RequestBody @Valid ModelUpdateRequest request) {
        String userId = UserContext.getUserId();
        adminLlmAppService.updateModel(request, userId);
        return Result.success();
    }

    /**
     * 删除官方模型
     */
    @DeleteMapping("/models/{modelId}")
    public Result<Void> deleteModel(@PathVariable String modelId) {
        String userId = UserContext.getUserId();
        adminLlmAppService.deleteModel(modelId, userId);
        return Result.success();
    }

    /**
     * 获取服务商的模型列表信息
     */
    @GetMapping("/models/{providerId}")
    public Result<List<ModelDTO>> getProviderModels(@PathVariable String providerId) {
        String userId = UserContext.getUserId();
        return Result.success(adminLlmAppService.getProviderModels(providerId,userId));
    }
}
