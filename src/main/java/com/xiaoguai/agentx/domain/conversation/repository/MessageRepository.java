package com.xiaoguai.agentx.domain.conversation.repository;


import com.xiaoguai.agentx.domain.conversation.model.MessageEntity;
import com.xiaoguai.agentx.infrastrcture.domain.ExtraMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-24 20:57
 * @Description: 消息领域
 */
@Mapper
public interface MessageRepository extends ExtraMapper<MessageEntity> {
}
