package com.xiaoguai.agentx.domain.conversation.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.domain.common.exception.EntityNotFoundException;
import com.xiaoguai.agentx.domain.conversation.model.Session;
import com.xiaoguai.agentx.domain.conversation.model.SessionDTO;
import com.xiaoguai.agentx.domain.conversation.repository.SessionRepository;
import com.xiaoguai.agentx.domain.conversation.service.ContextService;
import com.xiaoguai.agentx.domain.conversation.service.MessageService;
import com.xiaoguai.agentx.domain.conversation.service.SessionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-25 09:56
 * @Description: 会话服务
 */
@Service
public class SessionServiceImpl implements SessionService {


    private final SessionRepository sessionRepository;
    private final MessageService messageService;
    private final ContextService contextService;

    public SessionServiceImpl(SessionRepository sessionRepository, MessageService messageService, ContextService contextService) {
        this.sessionRepository = sessionRepository;
        this.messageService = messageService;
        this.contextService = contextService;
    }

    @Override
    @Transactional
    public SessionDTO createSession(String title,  String userId, String description) {
        Session session = Session.createNew(title, userId);
        session.setDescription(description);
        sessionRepository.insert(session);

        // 初始化上下文
        contextService.initializeContext(session.getId());

        return session.toDTO();
    }

    @Override
    public SessionDTO getSession(String sessionId) {
        Session session = sessionRepository.selectById(sessionId);
        if (session == null) {
            throw new EntityNotFoundException("会话不存在: " + sessionId);
        }
        return session.toDTO();
    }

    @Override
    public List<SessionDTO> getUserSessions(String userId) {
        LambdaQueryWrapper<Session> wrapper = Wrappers.<Session>lambdaQuery()
                .eq(Session::getUserId, userId)
                .orderByAsc(Session::getCreatedAt);

        return sessionRepository.selectList(wrapper)
                .stream()
                .map(Session::toDTO)
                .toList();
    }

    @Override
    public List<SessionDTO> getUserActiveSessions(String userId) {
        LambdaQueryWrapper<Session> wrapper = Wrappers.<Session>lambdaQuery()
                .eq(Session::getUserId, userId)
                .eq(Session::isArchived, false)
                .orderByDesc(Session::getUpdatedAt);

        return sessionRepository.selectList(wrapper)
                .stream()
                .map(Session::toDTO)
                .toList();
    }

    @Override
    public List<SessionDTO> getUserArchivedSessions(String userId) {
        LambdaQueryWrapper<Session> wrapper = Wrappers.<Session>lambdaQuery()
                .eq(Session::getUserId, userId)
                .eq(Session::isArchived, true)
                .orderByDesc(Session::getUpdatedAt);

        return sessionRepository.selectList(wrapper)
                .stream()
                .map(Session::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public SessionDTO updateSession(String sessionId, String title, String description) {
        Session session = sessionRepository.selectById(sessionId);
        if (session == null) {
            throw new EntityNotFoundException("<会话不存在>: " + sessionId);
        }
        session.update(title, description);

        session.updateById();
        return session.toDTO();
    }

    @Override
    @Transactional
    public SessionDTO archiveSession(String sessionId) {
        Session session = sessionRepository.selectById(sessionId);
        if (session == null) {
            throw new EntityNotFoundException("<会话不存在>: " + sessionId);
        }
        session.archive();
        session.updateById();

        return session.toDTO();
    }

    @Override
    @Transactional
    public SessionDTO activeSession(String sessionId) {
        Session session = sessionRepository.selectById(sessionId);
        if (session == null) {
            throw new EntityNotFoundException("<会话不存在>: " + sessionId);
        }
        session.unarchive();
        session.updateById();
        return session.toDTO();
    }

    @Override
    @Transactional
    public void deleteSession(String sessionId) {
        Session session = sessionRepository.selectById(sessionId);
        if (session == null) {
            throw new EntityNotFoundException("<会话不存在>: " + sessionId);
        }
        // 删除会话消息
        messageService.deleteSessionMessages(sessionId);

        // 删除上下文
        contextService.deleteContext(sessionId);

        // 删除会话
        session.deleteById();
    }

    @Override
    public List<SessionDTO> searchSessions(String userId, String keyWords) {
        LambdaQueryWrapper<Session> wrapper = Wrappers.<Session>lambdaQuery()
                .eq(Session::getUserId, userId)
                .like(Session::getTitle, keyWords)
                .orderByDesc(Session::getUserId);

        return sessionRepository.selectList(wrapper)
                .stream()
                .map(Session::toDTO)
                .toList();
    }
}
