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
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    /**
     * 获取已发布的知识库
     */
    @GetMapping("/public")
    public Result<List<KnowledgeBaseDTO>> listPublicKnowledgeBases() {
        return Result.success(knowledgeAppService.listPublicKnowledgeBases());
    }

    /**
     * 创建文件
     */
    @PostMapping("/files")
    public Result<KnowledgeFileDTO> createKnowledgeFile(@RequestBody @Valid CreateKnowledgeFileRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(knowledgeAppService.createKnowledgeFile(request, userId));
    }

    /**
     * 上传文件
     */
    @PostMapping(value = "/files/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<KnowledgeFileDTO> uploadKnowledgeFile(@RequestParam("knowledgeBaseId") String knowledgeBaseId,
                                                        @RequestPart("file") MultipartFile file) {
        String userId = UserContext.getUserId();
        return Result.success(knowledgeAppService.uploadKnowledgeFile(knowledgeBaseId, file, userId));
    }

    /**
     * 获取知识库文件
     */
    @GetMapping("/{kbId}/files")
    public Result<List<KnowledgeFileDTO>> listKnowledgeFiles(@PathVariable String kbId) {
        String userId = UserContext.getUserId();
        return Result.success(knowledgeAppService.listKnowledgeFiles(kbId, userId));
    }

    /**
     * 发布知识库
     */
    @PostMapping("/publish")
    public Result<KnowledgePublishRecordDTO> submitPublish(@RequestBody @Valid SubmitPublishRequest request) {
        String userId = UserContext.getUserId();
        return Result.success(knowledgeAppService.submitPublish(request, userId));
    }
}
