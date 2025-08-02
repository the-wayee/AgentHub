package com.xiaoguai.agentx.domain.agent.service;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.toolkit.SimpleQuery;
import com.xiaoguai.agentx.application.agent.assembler.AgentAssembler;
import com.xiaoguai.agentx.application.agent.assembler.AgentVersionAssembler;
import com.xiaoguai.agentx.domain.agent.constant.PublishStatus;
import com.xiaoguai.agentx.domain.agent.dto.AgentDTO;
import com.xiaoguai.agentx.domain.agent.dto.AgentVersionDTO;
import com.xiaoguai.agentx.domain.agent.model.AgentEntity;
import com.xiaoguai.agentx.domain.agent.model.AgentVersionEntity;
import com.xiaoguai.agentx.domain.agent.model.AgentWorkspaceEntity;
import com.xiaoguai.agentx.domain.agent.repository.AgentRepository;
import com.xiaoguai.agentx.domain.agent.repository.AgentVersionRepository;
import com.xiaoguai.agentx.domain.agent.repository.AgentWorkspaceRepository;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.utils.ValidationUtils;
import com.xiaoguai.agentx.interfaces.dto.agent.SearchAgentsRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-02 16:02
 * @Description: Agent服务实现类
 */
@Service
public class AgentDomainService {

    private final AgentRepository agentRepository;
    private final AgentVersionRepository agentVersionRepository;
    private final AgentWorkspaceRepository agentWorkspaceRepository;

    public AgentDomainService(AgentRepository agentRepository, AgentVersionRepository agentVersionRepository, AgentWorkspaceRepository agentWorkspaceRepository) {
        this.agentRepository = agentRepository;
        this.agentVersionRepository = agentVersionRepository;
        this.agentWorkspaceRepository = agentWorkspaceRepository;
    }

    /**
     * 创建Agent
     */
    public AgentDTO createAgent(AgentEntity agent) {
        // 参数校验
        ValidationUtils.notNull(agent, "agent");
        ValidationUtils.notEmpty(agent.getName(), "name");
        ValidationUtils.notEmpty(agent.getUserId(), "userId");

        // 保存到数据库
        agentRepository.insert(agent);
        return agent.toDTO();
    }

    /**
     * 获取单个Agent
     */
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

    /**
     * 获取用户的Agent列表，支持状态和名称过滤
     */
    public List<AgentDTO> getUserAgents(String userId, SearchAgentsRequest searchAgentsRequest) {
        // 参数校验
        ValidationUtils.notEmpty(userId, "userId");

        // 创建基础查询条件
        LambdaQueryWrapper<AgentEntity> queryWrapper = Wrappers.<AgentEntity>lambdaQuery()
                .eq(AgentEntity::getUserId, userId)
                .like(!StringUtils.isEmpty(searchAgentsRequest.getName()), AgentEntity::getName,
                        searchAgentsRequest.getName())
                .orderByDesc(AgentEntity::getUpdatedAt);

        // 执行查询并返回结果
        List<AgentEntity> agents = agentRepository.selectList(queryWrapper);
        return agents.stream().map(AgentAssembler::toDTO).collect(Collectors.toList());
    }

    /**
     * 更新Agent
     */
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

    /**
     * 切换Agent的启用/禁用状态
     */
    public AgentDTO toggleAgentStatus(String agentId) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");

        AgentEntity agent = agentRepository.selectById(agentId);
        if (agent == null) {
            throw new BusinessException("Agent不存在: " + agentId);
        }

        // 转换状态
        if (Boolean.TRUE.equals(agent.getEnabled())) {
            agent.disable();
        } else {
            agent.enable();
        }
        agentRepository.updateById(agent);
        return agent.toDTO();
    }

    /**
     * 删除Agent
     */
    public void deleteAgent(String agentId, String userId) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");
        ValidationUtils.notEmpty(userId, "userId");

        // 获取Agent
        AgentEntity agent = agentRepository.selectById(agentId);
        if (agent == null) {
            throw new BusinessException("Agent不存在: " + agentId);
        }
        // 删除 Agent
        agentRepository.deleteById(agentId);
        // 删除版本
        agentVersionRepository.delete(Wrappers.<AgentVersionEntity>lambdaQuery()
                .eq(AgentVersionEntity::getAgentId, agentId));
    }

    /**
     * 发布Agent版本
     */
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

    /**
     * 更新版本发布状态
     */
    public AgentVersionDTO updateVersionPublishStatus(String versionId, PublishStatus status) {
        // 参数校验
        ValidationUtils.notEmpty(versionId, "versionId");
        ValidationUtils.notNull(status, "status");
        AgentVersionEntity agentVersion = agentVersionRepository.selectById(versionId);
        if (agentVersion == null) {
            throw new BusinessException("当前版本不存在: " + versionId);
        }

        agentVersion.setRejectReason("");
        // 更新版本状态
        agentVersion.setPublishStatus(status.getCode());
        agentVersionRepository.updateById(agentVersion);

        if (status == PublishStatus.PUBLISHED) {
            // 如果是已发布，绑定agent的publishVersion
            String agentId = agentVersion.getAgentId();
            AgentEntity agent = agentRepository.selectById(agentId);
            if (agent != null) {
                agent.setPublishedVersion(agentVersion.getId());
                agentRepository.updateById(agent);
            }
        }

        return AgentAssembler.toDTO(agentVersion);
    }

    /**
     * 拒绝版本发布
     */
    public AgentVersionDTO rejectVersion(String versionId, String reason) {
        // 参数校验
        ValidationUtils.notEmpty(versionId, "versionId");
        ValidationUtils.notEmpty(reason, "reason");

        AgentVersionEntity agentVersion = agentVersionRepository.selectById(versionId);
        if (agentVersion == null) {
            throw new BusinessException("当前版本不存在: " + versionId);
        }
        // 更新拒绝状态
        agentVersion.setRejectReason(reason);
        agentVersion.setPublishStatus(PublishStatus.REJECTED.getCode());
        agentVersionRepository.updateById(agentVersion);

        return AgentVersionAssembler.toDTO(agentVersion);
    }


    /**
     * 获取Agent的所有版本
     */
    public List<AgentVersionDTO> getAgentVersions(String agentId, String userId) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");
        ValidationUtils.notEmpty(userId, "userId");
        List<AgentVersionEntity> agentVersions = agentVersionRepository.selectList(Wrappers.<AgentVersionEntity>lambdaQuery()
                .eq(AgentVersionEntity::getAgentId, agentId)
                .eq(AgentVersionEntity::getUserId, userId));

        return agentVersions.stream()
                .map(AgentVersionAssembler::toDTO)
                .toList();

    }


    /**
     * 获取已上架Agents列表
     * 根据name模糊查询
     */
    public List<AgentVersionDTO> getPublishedAgentsByName(SearchAgentsRequest searchAgentsRequest) {
        // 使用带名称和状态条件的查询
        List<AgentVersionEntity> latestVersions = agentVersionRepository.selectLatestVersionsByNameAndStatus(
                searchAgentsRequest.getName(),
                PublishStatus.PUBLISHED.getCode());

        // 过滤出 enable的agent 对应的版本
        return combineAgentsWithVersions(latestVersions);
    }

    /**
     * 获取待审核的Agent列表
     * 注意：现在需要查询发布状态为REVIEWING的版本
     */
    public List<AgentDTO> getPendingReviewAgents() {
        // 获取所有审核中状态的最新版本
        List<AgentVersionDTO> reviewingVersions = getVersionsByStatus(PublishStatus.REVIEWING);

        // 转换为AgentDTO列表
        return reviewingVersions.stream()
                .map(version -> {
                    // 查询助理信息
                    AgentEntity agent = agentRepository.selectById(version.getAgentId());
                    // 只返回已启用的助理
                    if (agent != null && Boolean.TRUE.equals(agent.getEnabled())) {
                        return AgentAssembler.toDTO(agent);
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * 获取Agent的特定版本
     */
    public AgentVersionDTO getAgentVersion(String agentId, String versionNumber) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");
        ValidationUtils.notEmpty(versionNumber, "versionNumber");

        // 使用agentId和versionNumber查询版本
        LambdaQueryWrapper<AgentVersionEntity> wrapper = Wrappers.<AgentVersionEntity>lambdaQuery()
                .eq(AgentVersionEntity::getAgentId, agentId)
                .eq(AgentVersionEntity::getVersionNumber, versionNumber);
        AgentVersionEntity version = agentVersionRepository.selectOne(wrapper);
        if (version == null) {
            throw new BusinessException("Agent版本不存在: " + versionNumber);
        }
        return AgentVersionAssembler.toDTO(version);
    }

    /**
     * 获取Agent的最新版本
     */
    public AgentVersionDTO getLatestAgentVersion(String agentId) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");

        LambdaQueryWrapper<AgentVersionEntity> queryWrapper = Wrappers.<AgentVersionEntity>lambdaQuery()
                .eq(AgentVersionEntity::getAgentId, agentId)
                .orderByDesc(AgentVersionEntity::getPublishedAt)
                .last("LIMIT 1");

        AgentVersionEntity version = agentVersionRepository.selectOne(queryWrapper);
        if (version == null) {
            return null; // 第一次发布时没有版本，返回null而不是抛出异常
        }
        return AgentVersionAssembler.toDTO(version);
    }

    /**
     * 根据指定状态获取Agent版本
     */
    public List<AgentVersionDTO> getVersionsByStatus(PublishStatus publishStatus) {
        List<AgentVersionEntity> agentVersions = agentVersionRepository.selectLatestVersionsByStatus(publishStatus == null ? null : publishStatus.getCode());

        // 转换为DTO列表并返回
        return agentVersions.stream()
                .map(AgentVersionAssembler::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * 根据 agentIds 获取 agents
     */
    public List<AgentDTO> getAgentsByIds(List<String> agentIds) {
        List<AgentEntity> agents = agentRepository.selectBatchIds(agentIds);
        return agents.stream().map(AgentAssembler::toDTO).collect(Collectors.toList());
    }

    public AgentDTO getAgentWithPermissionCheck(String agentId, String userId) {

        // 检查工作区是否存在
        boolean b1 = agentWorkspaceRepository.selectCount(Wrappers.<AgentWorkspaceEntity>lambdaQuery()
                .eq(AgentWorkspaceEntity::getAgentId, agentId)
                .eq(AgentWorkspaceEntity::getUserId, userId)) > 0;

        boolean b2 = checkAgentExist(agentId, userId);
        if (!b1 && !b2) {
            throw new BusinessException("助理不存在");
        }
        AgentDTO agentDTO = getAgent(agentId, userId);

        // 如果有版本则使用版本
        String publishedVersion = agentDTO.getPublishedVersion();
        if (!StringUtils.isEmpty(publishedVersion)) {
            AgentVersionDTO agentVersion =  getAgentVersionById(publishedVersion);
            BeanUtils.copyProperties(agentVersion, agentDTO);
        }

        return agentDTO;
    }

    /**
     * 根据版本id获取Agent版本
     */
    public AgentVersionDTO getAgentVersionById(String versionId){
        AgentVersionEntity agentVersion = agentVersionRepository.selectById(versionId);
        return AgentVersionAssembler.toDTO(agentVersion);
    }
    /**
     * 校验 agent 是否存在
     */
    public boolean checkAgentExist(String agentId, String userId) {

        LambdaQueryWrapper<AgentEntity> wrapper = Wrappers.<AgentEntity>lambdaQuery()
                .eq(AgentEntity::getId, agentId)
                .eq(AgentEntity::getUserId, userId);
        AgentEntity agent = agentRepository.selectOne(wrapper);
        return agent !=null;
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


    /**
     * 组合Agent和版本信息
     */
    private List<AgentVersionDTO> combineAgentsWithVersions(List<AgentVersionEntity> versionEntities) {
        if (versionEntities == null || versionEntities.isEmpty()) {
            return Collections.emptyList();
        }

        // 查找出版本中对应的enable的agent
        List<AgentEntity> agents = agentRepository.selectList(Wrappers.<AgentEntity>lambdaQuery()
                .in(AgentEntity::getId, versionEntities.stream().map(AgentVersionEntity::getAgentId).toList())
                .eq(AgentEntity::getEnabled, true));

        // 转换成 Map
        // Key: agentId
        // Value: 自身
        Map<String, AgentVersionEntity> agentVersionMap = versionEntities.stream()
                .collect(Collectors.toMap(AgentVersionEntity::getAgentId, Function.identity()));

        // 组合
        return agents.stream()
                .map(agent -> {
                    AgentVersionEntity agentVersionEntity = agentVersionMap.get(agent.getId());
                    return agentVersionEntity == null ? null : agentVersionEntity.toDTO();
                })
                .filter(Objects::nonNull)
                .toList();

    }


}
