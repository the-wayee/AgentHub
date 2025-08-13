package com.xiaoguai.agentx.interfaces.api.portal.llm;


import com.xiaoguai.agentx.application.llm.dto.ModelDTO;
import com.xiaoguai.agentx.application.llm.dto.ProviderDTO;
import com.xiaoguai.agentx.application.llm.service.LlmAppService;
import com.xiaoguai.agentx.domain.llm.model.ProviderAggregate;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.llm.ModelCreateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ProviderCreateRequest;
import com.xiaoguai.agentx.interfaces.dto.llm.ProviderUpdateRequest;
import okhttp3.Protocol;
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
    public Result<ProviderDTO> createProvider(@RequestBody ProviderCreateRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(llmAppService.createProvider(request, userId));
    }

    /**
     * 更新服务商
     */
    @PutMapping("/providers")
    public Result<ProviderDTO> createProvider(@RequestBody ProviderUpdateRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(llmAppService.updateProvider(request, userId));
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
     * 根据类型获取服务商列表
     */
    @GetMapping("/providers")
    public Result<List<ProviderAggregate>> getProvidersByType(
            @RequestParam(required = false, defaultValue = "all") String type) {
        String userId = UserContext.getUserId();
        return Result.success(llmAppService.getProvidersByType(type, userId));
    }


    /**
     * 创建model
     */
    @PostMapping("/models")
    public Result<ModelDTO> createModel(@RequestBody ModelCreateRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(llmAppService.createModel(request, userId));
    }


}
