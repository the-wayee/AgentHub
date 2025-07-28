package com.xiaoguai.agentx.domain.agent.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.domain.agent.model.AgentDTO;
import com.xiaoguai.agentx.domain.agent.model.entity.AgentEntity;
import com.xiaoguai.agentx.domain.agent.repository.AgentRepository;
import com.xiaoguai.agentx.domain.agent.service.AgentService;
import com.xiaoguai.agentx.domain.common.exception.BusinessException;
import com.xiaoguai.agentx.domain.common.utils.ValidationUtils;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-28 16:52
 * @Description: AgentServiceImpl
 */
@Service
public class AgentServiceImpl implements AgentService {

    @Resource
    private AgentRepository agentRepository;


    @Override
    @Transactional
    public AgentDTO createAgent(AgentEntity agent) {
        // 参数校验
        ValidationUtils.notNull(agent, "agent");
        ValidationUtils.notEmpty(agent.getName(), "name");
        ValidationUtils.notEmpty(agent.getUserId(), "userId");

        // 保存到数据库
        agentRepository.insert(agent);
        return agent.toDTO();
    }

    @Override
    public AgentDTO getAgent(String agentId, String userId) {
        ValidationUtils.notEmpty(agentId, "agentId");
        ValidationUtils.notEmpty(userId, "userId");

        LambdaQueryWrapper<AgentEntity> wrapper = Wrappers.<AgentEntity>lambdaQuery()
                .eq(AgentEntity::getUserId, userId)
                .eq(AgentEntity::getId, agentId);

        AgentEntity agentEntity = agentRepository.selectOne(wrapper);
        if (agentEntity == null) {
            throw new BusinessException("Agent不存在: " + agentId);
        }
        return agentEntity.toDTO();
    }

    @Override
    public AgentDTO updateAgent(String agentId, AgentEntity agent) {
        ValidationUtils.notEmpty(agentId, "agentId");
        ValidationUtils.notNull(agent, "agentDTO");
        ValidationUtils.notEmpty(agent.getUserId(), "userId");
        ValidationUtils.notEmpty(agent.getName(), "name");

        // 查询是否存在
        AgentDTO dto = this.getAgent(agentId, agent.getUserId());
        if (dto == null) {
            throw new BusinessException("Agent不存在: " + agentId);
        }

        // 更新Agent信息
        agentRepository.updateById(agent);
        return agent.toDTO();

    }

    @Override
    public List<AgentDTO> getUserAgents(String userId, String name) {
        ValidationUtils.notEmpty(userId, userId);

        LambdaQueryWrapper<AgentEntity> wrapper = Wrappers.<AgentEntity>lambdaQuery()
                .eq(AgentEntity::getUserId, userId)
                .like(StringUtils.isNotBlank(name), AgentEntity::getName, name);

        // 查询所有Agent
        List<AgentEntity> agents = agentRepository.selectList(wrapper);
        // 返回DTO
        return agents.stream().map(AgentEntity::toDTO).toList();
    }

}
