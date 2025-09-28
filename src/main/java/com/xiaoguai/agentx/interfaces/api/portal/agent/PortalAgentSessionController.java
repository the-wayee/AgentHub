package com.xiaoguai.agentx.interfaces.api.portal.agent;


import com.xiaoguai.agentx.application.agent.service.AgentSessionAppService;
import com.xiaoguai.agentx.application.conversation.dto.StreamChatRequest;
import com.xiaoguai.agentx.application.conversation.ConversationAppService;
import com.xiaoguai.agentx.application.conversation.dto.MessageDTO;
import com.xiaoguai.agentx.application.conversation.dto.SessionDTO;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.concurrent.ExecutorService;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-02 15:32
 * @Description: PortalAgentSessionController
 */
@RestController
@RequestMapping("/agent/session")
public class PortalAgentSessionController {

    private final static Logger logger = LoggerFactory.getLogger(PortalAgentSessionController.class);
    private final AgentSessionAppService agentSessionAppService;
    private final ConversationAppService conversationAppService;
    private final ExecutorService contextExecutorService;
    public PortalAgentSessionController(AgentSessionAppService agentSessionAppService, ConversationAppService conversationAppService, ExecutorService contextExecutorService) {
        this.agentSessionAppService = agentSessionAppService;
        this.conversationAppService = conversationAppService;
        this.contextExecutorService = contextExecutorService;
    }


    /**
     * 获取会话中的列表消息
     */
    @GetMapping("/{sessionId}/messages")
    public Result<List<MessageDTO>> getConversationMessages(@PathVariable String sessionId) {
        String userId = UserContext.getUserId();
        return Result.success(conversationAppService.getSessionMessages(sessionId, userId));
    }

    /**
     * 获取Agent会话列表
     */
    @GetMapping("/{agentId}")
    public Result<List<SessionDTO>> getAgentSessions(@PathVariable String agentId) {
        String userId = UserContext.getUserId();
        return Result.success(agentSessionAppService.getAgentSessions(agentId, userId));
    }

    /**
     * 创建会话
     */
    @PostMapping("/{agentId}")
    public Result<SessionDTO> createSession(@PathVariable String agentId) {
        String userId = UserContext.getUserId();
        return Result.success(agentSessionAppService.createSession(agentId, userId));
    }

    /**
     * 更新会话
     */
    @PutMapping("/{id}")
    public Result<Void> updateSession(@PathVariable String id, @RequestParam String title) {
        String userId = UserContext.getUserId();
        agentSessionAppService.updateSession(id, userId, title);
        return Result.success();
    }

    /**
     * 删除会话
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteSession(@PathVariable String id) {
        String userId = UserContext.getUserId();
        agentSessionAppService.deleteSession(id, userId);
        return Result.success();
    }

    /**
     * 发送消息
     *
     */
    @PostMapping("/chat")
    public SseEmitter sendMessage(@RequestBody StreamChatRequest request) {
        String userId = UserContext.getUserId();
        return conversationAppService.chatStream(request, userId);
    }
}
