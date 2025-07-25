package com.xiaoguai.agentx.infrastrcture.auth;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-25 11:25
 * @Description: UserAuthInterceptor
 */
@Component
public class UserAuthInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(UserAuthInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        try {
            // 验证用户身份（正常情况下应该从Token中解析用户ID）
            String userId = "1";
            logger.debug("设置用户ID: {}", userId);
            // 将用户ID设置到上下文
            UserContext.setUserId(userId);
            return true;
        } catch (Exception e) {
            logger.error("用户鉴权失败", e);
            return false;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContext.clear();
    }

}
