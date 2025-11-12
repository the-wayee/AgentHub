package com.xiaoguai.agentx.interfaces.api.admin;

import com.xiaoguai.agentx.application.knowledge.service.KnowledgeAppService;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.knowledge.ReviewPublishRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/knowledge")
public class AdminKnowledgeController {

    private final KnowledgeAppService knowledgeAppService;

    public AdminKnowledgeController(KnowledgeAppService knowledgeAppService) {
        this.knowledgeAppService = knowledgeAppService;
    }

    @PostMapping("/publish/review")
    public Result<Void> review(@RequestBody @Valid ReviewPublishRequest request) {
        String reviewerId = UserContext.getUserId();
        knowledgeAppService.reviewPublish(request, reviewerId);
        return Result.success();
    }
}

