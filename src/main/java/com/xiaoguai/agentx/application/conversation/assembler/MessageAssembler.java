package com.xiaoguai.agentx.application.conversation.assembler;


import com.xiaoguai.agentx.domain.conversation.dto.MessageDTO;
import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-02 14:44
 * @Description: 消息对象转换器
 */
public class MessageAssembler {
    /**
     * 将Message实体转换为MessageDTO
     *
     * @param message 消息实体
     * @return 消息DTO
     */
    public static MessageDTO toDTO(MessageEntity message) {
        if (message == null) {
            return null;
        }

        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setRole(message.getRole());
        dto.setContent(message.getContent());
        dto.setCreatedAt(message.getCreatedAt());

        return dto;
    }

    /**
     * 将消息实体列表转换为DTO列表
     *
     * @param messages 消息实体列表
     * @return 消息DTO列表
     */
    public static List<MessageDTO> toDTOList(List<MessageEntity> messages) {
        if (messages == null) {
            return Collections.emptyList();
        }

        return messages.stream()
                .map(MessageAssembler::toDTO)
                .collect(Collectors.toList());
    }
}
