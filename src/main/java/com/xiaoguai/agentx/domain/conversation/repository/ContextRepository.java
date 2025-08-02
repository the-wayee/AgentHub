package com.xiaoguai.agentx.domain.conversation.repository;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaoguai.agentx.domain.conversation.model.ContextEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-24 20:58
 * @Description: 上下文领域
 */
@Mapper
public interface ContextRepository extends BaseMapper<ContextEntity> {
}
