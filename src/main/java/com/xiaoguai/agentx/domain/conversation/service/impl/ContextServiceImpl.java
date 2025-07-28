package com.xiaoguai.agentx.domain.conversation.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.domain.conversation.model.Context;
import com.xiaoguai.agentx.domain.conversation.model.Message;
import com.xiaoguai.agentx.domain.conversation.model.MessageDTO;
import com.xiaoguai.agentx.domain.conversation.repository.ContextRepository;
import com.xiaoguai.agentx.domain.conversation.repository.MessageRepository;
import com.xiaoguai.agentx.domain.conversation.service.ContextService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-25 10:00
 * @Description: 上下文服务
 */
@Service
public class ContextServiceImpl implements ContextService {

    private final ContextRepository contextRepository;
    private final MessageRepository messageRepository;

    // 默认上下文窗口大小，实际项目中可通过配置文件设置
    private static final int DEFAULT_CONTEXT_SIZE = 10;

    public ContextServiceImpl(ContextRepository contextRepository, MessageRepository messageRepository) {
        this.contextRepository = contextRepository;
        this.messageRepository = messageRepository;
    }

    @Override
    public List<MessageDTO> getContextMessages(String sessionId) {
        Context context = getOrCreateContext(sessionId);

        List<String> messageIds = context.getActiveMessageIds();

        List<MessageDTO> messages = new ArrayList<>();
        for (String messageId : messageIds) {
            Message message = messageRepository.selectById(messageId);
            messages.add(message.toDTO());
        }
        return messages;

    }

    @Override
    @Transactional
    public void addMessageToContext(String messageId, String sessionId) {
        Context context = getOrCreateContext(sessionId);
        context.addMessage(messageId);
        contextRepository.updateById(context);

        // 更新会话需要判断是否需要滑动窗口
        updateContext(sessionId);
    }

    @Override
    @Transactional
    public void updateContext(String sessionId) {
        Context context = getOrCreateContext(sessionId);

        List<String> messageIds = context.getActiveMessageIds();
        if (messageIds.size() > DEFAULT_CONTEXT_SIZE) {
            List<String> newMessageIds = messageIds.subList(messageIds.size() - DEFAULT_CONTEXT_SIZE, messageIds.size());
            context.setActiveMessageIds(newMessageIds);
            context.setUpdatedAt(LocalDateTime.now());

            contextRepository.updateById(context);
        }
    }

    @Override
    @Transactional
    public void clearContext(String sessionId) {
        Context context = getOrCreateContext(sessionId);
        context.clear();

        contextRepository.updateById(context);
    }

    @Override
    @Transactional
    public void initializeContext(String sessionId) {
        getOrCreateContext(sessionId);
    }

    @Override
    @Transactional
    public void deleteContext(String sessionId) {
        Context context = getOrCreateContext(sessionId);

        context.deleteById();
    }

    /**
     * 获取或者创建上下文
     */
    private Context getOrCreateContext(String sessionId) {
        LambdaQueryWrapper<Context> wrapper = Wrappers.<Context>lambdaQuery()
                .eq(Context::getSessionId, sessionId);
        Context context = contextRepository.selectOne(wrapper);
        if (context == null) {
            Context newContext = Context.createNew(sessionId);
            contextRepository.insert(newContext);
            return newContext;
        }
        return context;
    }
}
