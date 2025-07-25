package com.xiaoguai.agentx.domain.conversation.repository;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaoguai.agentx.domain.conversation.model.Session;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-24 20:57
 * @Description: 会话领域
 */
@Mapper
public interface SessionRepository extends BaseMapper<Session> {
}
