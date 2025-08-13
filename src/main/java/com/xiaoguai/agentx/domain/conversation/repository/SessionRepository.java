package com.xiaoguai.agentx.domain.conversation.repository;


import com.xiaoguai.agentx.domain.conversation.model.SessionEntity;
import com.xiaoguai.agentx.infrastrcture.domain.ExtraMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-24 20:57
 * @Description: 会话领域
 */
@Mapper
public interface SessionRepository extends ExtraMapper<SessionEntity> {
}
