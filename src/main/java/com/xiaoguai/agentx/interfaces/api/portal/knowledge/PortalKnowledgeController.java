package com.xiaoguai.agentx.interfaces.api.portal.knowledge;

import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeBaseDTO;
import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeFileDTO;
import com.xiaoguai.agentx.application.knowledge.dto.KnowledgePublishRecordDTO;
import com.xiaoguai.agentx.application.knowledge.service.KnowledgeAppService;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.knowledge.CreateKnowledgeBaseRequest;
import com.xiaoguai.agentx.interfaces.dto.knowledge.CreateKnowledgeFileRequest;
import com.xiaoguai.agentx.interfaces.dto.knowledge.SubmitPublishRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/knowledge")
public class PortalKnowledgeController {

    private final KnowledgeAppService knowledgeAppService;

    public PortalKnowledgeController(KnowledgeAppService knowledgeAppService) {
        this.knowledgeAppService = knowledgeAppService;
    }

    /**
     * 创建知识库
     */
    @PostMapping
    public Result<KnowledgeBaseDTO> createKnowledgeBase(@RequestBody @Valid CreateKnowledgeBaseRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(knowledgeAppService.createKnowledgeBase(request, userId));
    }

    /**
     * 获取我创建的知识库
     * @return
     */
    @GetMapping
    public Result<List<KnowledgeBaseDTO>> listMyKnowledgeBases() {
        String userId = UserContext.getUserId();
        return Result.success(knowledgeAppService.listMyKnowledges(userId));
    }

    @GetMapping("/public")
    public Result<List<KnowledgeBaseDTO>> listPublicKnowledgeBases() {
        return Result.success(knowledgeAppService.listPublicKnowledgeBases());
    }

    @PostMapping("/files")
    public Result<KnowledgeFileDTO> createKnowledgeFile(@RequestBody @Valid CreateKnowledgeFileRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(knowledgeAppService.createKnowledgeFile(request, userId));
    }

    @GetMapping("/{kbId}/files")
    public Result<List<KnowledgeFileDTO>> listKnowledgeFiles(@PathVariable String kbId) {
        String userId = UserContext.getUserId();
        return Result.success(knowledgeAppService.listKnowledgeFiles(kbId, userId));
    }

    @PostMapping("/publish")
    public Result<KnowledgePublishRecordDTO> submitPublish(@RequestBody @Valid SubmitPublishRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(knowledgeAppService.submitPublish(request, userId));
    }
}

