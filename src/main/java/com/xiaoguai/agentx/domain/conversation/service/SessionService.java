package com.xiaoguai.agentx.domain.conversation.service;


import com.xiaoguai.agentx.domain.conversation.model.SessionDTO;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-24 21:00
 * @Description: 会话服务
 */
public interface SessionService {

    /**
     * 创建会话
     */
    SessionDTO createSession(String title, String description, String userId);

    /**
     * 查询单个会话
     */
    SessionDTO getSession(String sessionId);

    /**
     * 获取用户所有会话列表
     */
    List<SessionDTO> getUserSessions(String userId);

    /**
     * 获取用户活跃会话列表
     */
    List<SessionDTO> getUserActiveSessions(String userId);

    /**
     * 获取用户归档会话列表
     */
    List<SessionDTO> getUserArchivedSessions(String userId);

    /**
     * 更新会话信息
     */
    SessionDTO updateSession(String sessionId, String title, String description);


    /**
     * 归档会话
     */
    SessionDTO archiveSession(String sessionId);

    /**
     * 恢复会话
     */
    SessionDTO activeSession(String sessionId);

    /**
     * 删除会话
     */
    void deleteSession(String sessionId);

    /**
     * 搜索会话
     */
    List<SessionDTO> searchSessions(String userId, String keyWords);
}
