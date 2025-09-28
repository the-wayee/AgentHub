package com.xiaoguai.agentx.domain.conversation.service;


import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.domain.conversation.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 15:40
 * @Description: 消息领域服务
 */
@Service
public class MessageDomainService {

    private final MessageRepository messageRepository;

    public MessageDomainService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    /**
     * 根究ids获取消息列表
     * @param ids ids
     * @return 消息列表
     */
    public List<MessageEntity> listByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }
        return messageRepository.selectBatchIds(ids);
    }

    public void updateMessage(MessageEntity messageEntity) {
        messageRepository.checkUpdateById(messageEntity);
    }
}
