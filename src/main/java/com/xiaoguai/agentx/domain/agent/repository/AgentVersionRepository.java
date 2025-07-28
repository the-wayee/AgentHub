package com.xiaoguai.agentx.domain.agent.repository;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaoguai.agentx.domain.agent.model.entity.AgentVersionEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-28 16:49
 * @Description: Agent版本仓库
 */
@Mapper
public interface AgentVersionRepository extends BaseMapper<AgentVersionEntity> {
}
