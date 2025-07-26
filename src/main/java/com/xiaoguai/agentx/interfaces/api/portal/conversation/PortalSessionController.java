package com.xiaoguai.agentx.interfaces.api.portal.conversation;


import com.xiaoguai.agentx.application.conversation.service.ConversationAppService;
import com.xiaoguai.agentx.application.conversation.service.MessageAppService;
import com.xiaoguai.agentx.application.conversation.service.SessionAppService;
import com.xiaoguai.agentx.domain.conversation.model.MessageDTO;
import com.xiaoguai.agentx.domain.conversation.model.SessionDTO;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.conversation.CreateAndChatRequest;
import com.xiaoguai.agentx.interfaces.dto.conversation.CreateSessionRequest;
import com.xiaoguai.agentx.interfaces.dto.conversation.SendMessageRequest;
import com.xiaoguai.agentx.interfaces.dto.conversation.UpdateSessionRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

/**
 * 会话管理
 */
@RestController
@RequestMapping("/conversation")
public class PortalSessionController {

    private final SessionAppService sessionAppService;
    private final MessageAppService messageAppService;
    private final ConversationAppService conversationAppService;

    public PortalSessionController(SessionAppService sessionAppService, MessageAppService messageAppService, ConversationAppService conversationAppService) {
        this.sessionAppService = sessionAppService;
        this.messageAppService = messageAppService;
        this.conversationAppService = conversationAppService;
    }


    /**
     * 创建会话并发送第一条消息
     */
    @PostMapping("/session/create-and-chat")
    public SseEmitter createAndChat(@RequestBody CreateAndChatRequest request) {
        String userId = UserContext.getUserId();
        return conversationAppService.createSessionAndChat(request.getTitle(), userId, request.getContent());
    }

    /**
     * 聊天流式获取回复
     */
    @PostMapping("/chat/{sessionId}")
    public SseEmitter chatStream(@PathVariable String sessionId, @RequestBody SendMessageRequest request) {
        return conversationAppService.chatStream(sessionId, request.getContent());
    }

    /**
     * 创建会话
     */
    @PostMapping("/session")
    public Result<SessionDTO> createSession(@RequestBody CreateSessionRequest request) {
        String userId = UserContext.getUserId();
        SessionDTO session = sessionAppService.createSession(
                request.getTitle(),
                userId,
                request.getDescription()
        );
        return Result.success(session);
    }

    /**
     * 获取所有会话列表
     */
    @GetMapping("/session")
    public Result<List<SessionDTO>> getSessions(@RequestParam(required = false) Boolean archived) {
        String userId = UserContext.getUserId();
        List<SessionDTO> sessions;
        if (archived != null) {
            if (archived) {
                sessions = sessionAppService.getUserArchivedSessions(userId);
            } else {
                sessions = sessionAppService.getUserActiveSessions(userId);
            }
        } else {
            sessions = sessionAppService.getUserSessions(userId);
        }
        return Result.success(sessions);
    }

    /**
     * 获取单个会话
     */
    @GetMapping("/session/{sessionId}")
    public Result<SessionDTO> getUserSessions(@PathVariable String sessionId) {
        SessionDTO session = sessionAppService.getSession(sessionId);
        return Result.success(session);
    }

    /**
     * 更新用户会话
     */
    @PutMapping("/session/{sessionId}")
    public Result<SessionDTO> updateUserSession(@PathVariable String sessionId, @RequestBody UpdateSessionRequest request) {
        SessionDTO sessionDTO = sessionAppService.updateSession(sessionId, request.getTitle(), request.getDescription());
        return Result.success(sessionDTO);
    }

    /**
     * 归档会话
     */
    @PutMapping("/session/{sessionId}/archive")
    public Result<SessionDTO> archiveSession(@PathVariable String sessionId) {
        SessionDTO sessionDTO = sessionAppService.archiveSession(sessionId);
        return Result.success(sessionDTO);
    }

    /**
     * 恢复会话
     */
    @PutMapping("/session/{sessionId}/unarchive")
    public Result<SessionDTO> activeSession(@PathVariable String sessionId) {
        SessionDTO sessionDTO = sessionAppService.activeSession(sessionId);
        return Result.success(sessionDTO);
    }

    /**
     * 删除会话
     */
    @DeleteMapping("/session/{sessionId}")
    public Result<Void> deleteSession(@PathVariable String sessionId) {
        sessionAppService.deleteSession(sessionId);
        return Result.success();
    }

    /**
     * 获取会话消息列表
     */
    @GetMapping("/session/{sessionId}/messages")
    public Result<List<MessageDTO>> getSessionMessages(@PathVariable String sessionId) {
        List<MessageDTO> messages = messageAppService.getSessionMessages(sessionId);
        return Result.success(messages);
    }

    /**
     * 清除会话上下文
     */
    @PostMapping("/session/{sessionId}/clear-context")
    public Result<Void> clearSessionContext(@PathVariable String sessionId) {
        conversationAppService.clearContext(sessionId);
        return Result.success();
    }
}

