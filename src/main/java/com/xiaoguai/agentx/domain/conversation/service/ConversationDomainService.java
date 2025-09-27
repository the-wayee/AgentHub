package com.xiaoguai.agentx.domain.conversation.service;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.application.conversation.assembler.MessageAssembler;
import com.xiaoguai.agentx.application.conversation.dto.MessageDTO;
import com.xiaoguai.agentx.domain.conversation.constants.Role;
import com.xiaoguai.agentx.domain.conversation.model.ContextEntity;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.repository.ContextRepository;
import com.xiaoguai.agentx.domain.conversation.repository.MessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-02 14:38
 * @Description: 对话服务实现
 */
@Service
public class ConversationDomainService {

    private final Logger logger = LoggerFactory.getLogger(ConversationDomainService.class);
    private final MessageRepository messageRepository;
    private final ContextRepository contextRepository;
    private final SessionDomainService sessionDomainService;

    public ConversationDomainService(MessageRepository messageRepository, ContextRepository contextRepository, SessionDomainService sessionDomainService) {
        this.messageRepository = messageRepository;
        this.contextRepository = contextRepository;
        this.sessionDomainService = sessionDomainService;
    }

    /**
     * 获取会话中的消息列表
     */
    public List<MessageDTO> getConversationMessages(String sessionId) {
        List<MessageEntity> messageEntities = messageRepository.selectList(Wrappers.<MessageEntity>lambdaQuery()
                .eq(MessageEntity::getSessionId, sessionId)
                .orderByAsc(MessageEntity::getCreatedAt));
        return messageEntities.stream()
                .filter(f -> !f.getRole().equals(Role.SYSTEM))
                .map(MessageAssembler::toDTO).toList();
    }

    /**
     * 保存上下文消息
     */
    public void saveMessagesToContext(List<MessageEntity> messages, ContextEntity contextEntity) {
        messageRepository.insert(messages);

        List<String> activeMessages = contextEntity.getActiveMessages();
        for (MessageEntity message : messages) {
            activeMessages.add(message.getId());
        }
        contextRepository.insertOrUpdate(contextEntity);
    }

    /**
     * 保存消息
     */
    public void saveMessage(MessageEntity message) {
        messageRepository.insert(message);
    }

    /**
     * 删除上下文消息
     */
    public void deleteConversationMessages(String sessionId) {
        LambdaQueryWrapper<MessageEntity> wrapper = Wrappers.<MessageEntity>lambdaQuery()
                .eq(MessageEntity::getSessionId, sessionId);
        messageRepository.checkDelete(wrapper);

        LambdaQueryWrapper<ContextEntity> contextWrapper = Wrappers.<ContextEntity>lambdaQuery()
                .eq(ContextEntity::getSessionId, sessionId);
        contextRepository.checkDelete(contextWrapper);
    }

    public void deleteConversationMessages(List<String> sessionIds) {
        LambdaQueryWrapper<MessageEntity> wrapper = Wrappers.<MessageEntity>lambdaQuery()
                .in(MessageEntity::getSessionId, sessionIds);
        messageRepository.checkDelete(wrapper);
    }

}


