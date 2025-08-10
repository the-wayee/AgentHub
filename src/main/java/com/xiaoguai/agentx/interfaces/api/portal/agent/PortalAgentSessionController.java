package com.xiaoguai.agentx.interfaces.api.portal.agent;


import com.xiaoguai.agentx.application.agent.service.AgentSessionAppService;
import com.xiaoguai.agentx.application.conversation.dto.StreamChatRequest;
import com.xiaoguai.agentx.application.conversation.service.ConversationAppService;
import com.xiaoguai.agentx.domain.conversation.dto.MessageDTO;
import com.xiaoguai.agentx.domain.conversation.dto.SessionDTO;
import com.xiaoguai.agentx.infrastrcture.auth.UserContext;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.conversation.ConversationRequest;
import org.apache.ibatis.annotations.Delete;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
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
     * @param id 会话id
     */
    @PostMapping("/{id}/message")
    public SseEmitter sendMessage(@PathVariable String id, @RequestBody ConversationRequest request) {
        String userId = UserContext.getUserId();

        // 设置sse发射器，超时时间5min
        SseEmitter emitter = new SseEmitter(300000L);

        // 存储用户信息到数据库
        conversationAppService.sendMessage(id, userId, request.getMessage(), null);

        // 异步发送消息
        contextExecutorService.execute(() -> {

            try {
                StreamChatRequest chatRequest = new StreamChatRequest();
                chatRequest.setMessage(request.getMessage());
                chatRequest.setSessionId(id);
                chatRequest.setStream(true);

                // 收集LLM完整回复
                StringBuilder fullAssistantResponse = new StringBuilder();
                String[] provider = {null};
                String[] model = {null};


                conversationAppService.chatStream(chatRequest, (response, isLast, isReasoning) -> {
                    try {
                        // 收集供应商
                        if (provider[0] == null) {
                            provider[0] = response.getProvider();
                        }

                        // 收集模型
                        if (model[0] == null) {
                            model[0] = response.getModel();
                        }

                        // 非推理模式，收集回复内容
                        if (!isReasoning) {
                            fullAssistantResponse.append(response.getContent());
                        }

                        // 发送响应块给客户端
                        emitter.send(response);

                        if (isLast) {
                            // 这里模拟token计数为内容长度，实际应使用真实的token计数
                            int tokenCount = fullAssistantResponse.length() / 4; // 简单估算
                            conversationAppService.saveAssistantMessage(id,
                                    fullAssistantResponse.toString(),
                                    provider[0],
                                    model[0],
                                    tokenCount);
                            emitter.complete();
                        }
                    } catch (IOException e) {
                        logger.error("====> 发送流式响应块错误",e);
                        emitter.completeWithError(e);
                    }
                });
            } catch (Exception e) {
                logger.error("处理Agent会话消息请求发生异常",e);
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }
}
