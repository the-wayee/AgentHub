package com.xiaoguai.agentx.domain.agent.service;


import com.xiaoguai.agentx.domain.agent.model.AgentDTO;
import com.xiaoguai.agentx.domain.agent.model.entity.AgentEntity;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-28 16:50
 * @Description: AgentService
 */
public interface AgentService {

    /**
     * 创建Agent
     * @param entity Agent实体对象
     * @return 创建的Agent信息
     */
    AgentDTO createAgent(AgentEntity entity);

    /**
     * 获取Agent信息
     * @param agentId Agent ID-nonNull
     * @param userId 用户id
     * @return Agent信息
     */
    AgentDTO getAgent(String agentId, String userId);

    /**
     * 更新Agent信息
     * @param agentId agentId
     * @param agentDTO 更新后的Agent信息
     */
    AgentDTO updateAgent(String agentId, AgentEntity agentDTO);

    /**
     * 获取用户所有的Agent
     * @param userId  用户id-nonNull
     * @param name agent名称，模糊查询
     * @return 更新后的Agent信息
     */
    List<AgentDTO> getUserAgents(String userId, String name);
}
