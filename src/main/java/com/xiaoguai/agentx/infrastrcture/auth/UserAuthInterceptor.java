package com.xiaoguai.agentx.infrastrcture.auth;


import com.xiaoguai.agentx.infrastrcture.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
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

    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        try {
            // 从请求同中获取Token
            String authorToken = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (!StringUtils.hasText(authorToken) || !authorToken.startsWith(BEARER_PREFIX)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return false;
            }

            // 获取token
            String token = authorToken.substring(BEARER_PREFIX.length());

            // 验证token
            if (!JwtUtils.validateToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return false;
            }

            // 解析用户id并且放入到上下文
            String userId = JwtUtils.getUserIdFromToken(token);
            UserContext.setUserId(userId);
            return true;

        } catch (Exception e) {
            logger.error("用户鉴权失败", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContext.clear();
    }

}
