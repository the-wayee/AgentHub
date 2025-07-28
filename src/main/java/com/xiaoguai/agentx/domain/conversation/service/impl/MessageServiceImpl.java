package com.xiaoguai.agentx.domain.conversation.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.domain.common.exception.EntityNotFoundException;
import com.xiaoguai.agentx.domain.conversation.model.Message;
import com.xiaoguai.agentx.domain.conversation.model.MessageDTO;
import com.xiaoguai.agentx.domain.conversation.model.Session;
import com.xiaoguai.agentx.domain.conversation.repository.MessageRepository;
import com.xiaoguai.agentx.domain.conversation.repository.SessionRepository;
import com.xiaoguai.agentx.domain.conversation.service.ContextService;
import com.xiaoguai.agentx.domain.conversation.service.MessageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-25 10:00
 * @Description: 消息服务
 */
@Service
public class MessageServiceImpl implements MessageService {

    private final SessionRepository sessionRepository;
    private final ContextService contextService;
    private final MessageRepository messageRepository;

    public MessageServiceImpl(SessionRepository sessionRepository, ContextService contextService, MessageRepository messageRepository) {
        this.sessionRepository = sessionRepository;
        this.contextService = contextService;
        this.messageRepository = messageRepository;
    }

    @Override
    public MessageDTO sendUserMessage(String sessionId, String content) {
        Session session = sessionRepository.selectById(sessionId);
        if (session == null) {
            throw new EntityNotFoundException("会话不存在: " + sessionId);
        }

        // 新增消息
        Message userMessage = Message.createUserMessage(sessionId, content);
        userMessage.insert();

        // 更新会话时间
        session.setUpdatedAt(LocalDateTime.now());
        session.updateById();

        // 更新上下文
        contextService.addMessageToContext(userMessage.getId(), sessionId);

        return userMessage.toDTO();
    }

    @Override
    @Transactional
    public MessageDTO saveAssistantMessage(String sessionId, String content, String model, String provider, Integer tokenCount) {
        Session session = sessionRepository.selectById(sessionId);
        if (session == null) {
            throw new EntityNotFoundException("会话不存在: " + sessionId);
        }

        // 新增消息
        Message assistantMessage = Message.createAssistantMessage(sessionId, content, provider, model, tokenCount);
        assistantMessage.insert();

        // 更新会话时间
        session.setUpdatedAt(LocalDateTime.now());
        session.updateById();

        // 更新上下文
        contextService.addMessageToContext(assistantMessage.getId(), sessionId);

        return assistantMessage.toDTO();
    }

    @Override
    @Transactional
    public MessageDTO saveSystemMessage(String sessionId, String content) {
        Session session = sessionRepository.selectById(sessionId);
        if (session == null) {
            throw new EntityNotFoundException("会话不存在: " + sessionId);
        }

        // 新增消息
        Message systemMessage = Message.createSystemMessage(sessionId, content);
        systemMessage.insert();

        // 更新会话时间
        session.setUpdatedAt(LocalDateTime.now());
        session.updateById();

        // 更新上下文
        contextService.addMessageToContext(systemMessage.getId(), sessionId);

        return systemMessage.toDTO();
    }

    @Override
    public List<MessageDTO> getSessionMessages(String sessionId) {
        Session session = sessionRepository.selectById(sessionId);
        if (session == null) {
            throw new EntityNotFoundException("会话不存在: " + sessionId);
        }
        LambdaQueryWrapper<Message> wrapper = Wrappers.<Message>lambdaQuery()
                .eq(Message::getSessionId, sessionId)
                .orderByAsc(Message::getCreatedAt);
        List<Message> messages = messageRepository.selectList(wrapper);

        return messages.stream()
                .map(Message::toDTO)
                .toList();
    }

    @Override
    public List<MessageDTO> getRecentMessages(String sessionId, int count) {
        Session session = sessionRepository.selectById(sessionId);
        if (session == null) {
            throw new EntityNotFoundException("会话不存在: " + sessionId);
        }
        LambdaQueryWrapper<Message> wrapper = Wrappers.<Message>lambdaQuery()
                .eq(Message::getSessionId, sessionId)
                .orderByDesc(Message::getCreatedAt)
                .last("LIMIT " + count);
        List<Message> messages = messageRepository.selectList(wrapper);

        return messages.stream()
                .sorted((m1, m2) -> m1.getCreatedAt().compareTo(m2.getCreatedAt()))
                .map(Message::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public void deleteMessage(String messageId) {
        messageRepository.deleteById(messageId);
    }

    @Override
    @Transactional
    public void deleteSessionMessages(String sessionId) {
        // 使用LambdaQueryWrapper删除指定会话的所有消息
        LambdaQueryWrapper<Message> wrapper = Wrappers.<Message>lambdaQuery()
                .eq(Message::getSessionId, sessionId);
        messageRepository.delete(wrapper);
    }
}
