package com.xiaoguai.agentx.domain.conversation.service;


import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.domain.conversation.model.ContextEntity;
import com.xiaoguai.agentx.domain.conversation.repository.ContextRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 14:36
 * @Description: 上下文领域服务
 */
@Service
public class ContextDomainService {

    private static final Logger logger = LoggerFactory.getLogger(ContextDomainService.class);

    private final ContextRepository contextRepository;

    public ContextDomainService(ContextRepository contextRepository) {
        this.contextRepository = contextRepository;
    }

    public void insertOrUpdate(ContextEntity context) {
        try {
            contextRepository.insertOrUpdate(context);
        } catch (Exception e) {
            logger.error("更新上下文失败: {}", e.getMessage());
        }
    }

    /**
     * 根据会话id获取上下文
     * @param sessionId 会话id
     * @return 上下文
     */
    public ContextEntity findBySessionId(String sessionId) {
        LambdaQueryWrapper<ContextEntity> wrapper = Wrappers.<ContextEntity>lambdaQuery()
                .eq(ContextEntity::getSessionId, sessionId);
        return contextRepository.selectOne(wrapper);
    }
}
