package com.xiaoguai.agentx.domain.agent.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.domain.agent.model.AgentDTO;
import com.xiaoguai.agentx.domain.agent.model.AgentVersionDTO;
import com.xiaoguai.agentx.domain.agent.model.entity.AgentEntity;
import com.xiaoguai.agentx.domain.agent.model.entity.AgentVersionEntity;
import com.xiaoguai.agentx.domain.agent.model.enums.PublishStatus;
import com.xiaoguai.agentx.domain.agent.repository.AgentRepository;
import com.xiaoguai.agentx.domain.agent.repository.AgentVersionRepository;
import com.xiaoguai.agentx.domain.agent.service.AgentService;
import com.xiaoguai.agentx.domain.common.exception.BusinessException;
import com.xiaoguai.agentx.domain.common.utils.ValidationUtils;
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

    private final AgentRepository agentRepository;
    private final AgentVersionRepository agentVersionRepository;

    public AgentServiceImpl(AgentRepository agentRepository, AgentVersionRepository agentVersionRepository) {
        this.agentRepository = agentRepository;
        this.agentVersionRepository = agentVersionRepository;
    }


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

    @Override
    public AgentVersionDTO publishAgentVersion(String agentId, AgentVersionEntity agentVersionEntity) {
        ValidationUtils.notEmpty(agentId, "agentId");
        ValidationUtils.notNull(agentVersionEntity, "agentVersionEntity");
        ValidationUtils.notEmpty(agentVersionEntity.getVersionNumber(), "versionNumber");
        ValidationUtils.notEmpty(agentVersionEntity.getUserId(), "userId");

        AgentDTO dto = this.getAgent(agentId, agentVersionEntity.getUserId());
        if (dto == null) {
            throw new BusinessException("Agent不存在: " + agentId);
        }

        // 查询最新的版本号
        LambdaQueryWrapper<AgentVersionEntity> wrapper = Wrappers.<AgentVersionEntity>lambdaQuery()
                .eq(AgentVersionEntity::getUserId, agentVersionEntity.getUserId())
                .eq(AgentVersionEntity::getAgentId, agentId)
                .orderByDesc(AgentVersionEntity::getVersionNumber)
                .last("limit 1");

        AgentVersionEntity latestVersionEntity = agentVersionRepository.selectOne(wrapper);

        if (latestVersionEntity != null) {
            String latestVersion = latestVersionEntity.getVersionNumber();
            String currentVersion = agentVersionEntity.getVersionNumber();
            if (latestVersion.equals(currentVersion)) {
                throw new BusinessException("当前版本号已存在: " + currentVersion);
            }
            if (!isVersionGreaterThan(currentVersion, latestVersion)) {
                throw new BusinessException("新版本号(" + currentVersion + ")必须大于当前最新版本号(" + latestVersion + ")");
            }
        }

        // 设置关联的Agent
        agentVersionEntity.setAgentId(agentId);

        // 设置审核状态
        agentVersionEntity.setPublishStatus(PublishStatus.REVIEWING.getCode());

        agentVersionRepository.insert(agentVersionEntity);
        return agentVersionEntity.toDTO();


    }

    @Override
    public AgentVersionDTO getAgentLatestVersion(String agentId) {
        ValidationUtils.notEmpty(agentId, "agentId");

        LambdaQueryWrapper<AgentVersionEntity> wrapper = Wrappers.<AgentVersionEntity>lambdaQuery()
                .eq(AgentVersionEntity::getAgentId, agentId)
                .orderByDesc(AgentVersionEntity::getVersionNumber)
                .last("LIMIT 1");
        AgentVersionEntity latestVersionEntity = agentVersionRepository.selectOne(wrapper);
        if (latestVersionEntity == null) {
            // 第一次没有最新版本，返回null
            return null;
        }
        return latestVersionEntity.toDTO();

    }


    /**
     * 比较版本号大小
     *
     * @param newVersion 新版本号
     * @param oldVersion 旧版本号
     * @return 如果新版本大于旧版本返回true，否则返回false
     */
    private boolean isVersionGreaterThan(String newVersion, String oldVersion) {
        if (oldVersion == null || oldVersion.trim().isEmpty()) {
            return true; // 如果没有旧版本，新版本肯定更大
        }

        // 分割版本号
        String[] current = newVersion.split("\\.");
        String[] last = oldVersion.split("\\.");

        // 确保版本号格式正确
        if (current.length != 3 || last.length != 3) {
            throw new BusinessException("版本号必须遵循 x.y.z 格式");
        }

        try {
            // 比较主版本号
            int currentMajor = Integer.parseInt(current[0]);
            int lastMajor = Integer.parseInt(last[0]);
            if (currentMajor > lastMajor) {
                return true;
            }
            if (currentMajor < lastMajor) {
                return false;
            }

            // 主版本号相同，比较次版本号
            int currentMinor = Integer.parseInt(current[1]);
            int lastMinor = Integer.parseInt(last[1]);
            if (currentMinor > lastMinor) {
                return true;
            }
            if (currentMinor < lastMinor) {
                return false;
            }

            // 主版本号和次版本号都相同，比较修订版本号
            int currentPatch = Integer.parseInt(current[2]);
            int lastPatch = Integer.parseInt(last[2]);

            return currentPatch > lastPatch;
        } catch (NumberFormatException e) {
            throw new BusinessException("版本号格式错误，必须是数字: " + e.getMessage());
        }
    }
}
