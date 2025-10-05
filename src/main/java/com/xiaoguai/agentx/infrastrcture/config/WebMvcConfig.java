package com.xiaoguai.agentx.infrastrcture.config;


import com.xiaoguai.agentx.infrastrcture.auth.UserAuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-25 11:28
 * @Description: WebMvcConfig
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final UserAuthInterceptor userAuthInterceptor;

    public WebMvcConfig(UserAuthInterceptor userAuthInterceptor) {
        this.userAuthInterceptor = userAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(userAuthInterceptor).addPathPatterns("/**") // 拦截所有请求
                .excludePathPatterns( // 不拦截以下路径
                        "/login", // 登录接口
                        "/register", // 注册接口
                        "/send-email-code", "/verify-email-code", "/get-captcha", "/reset-password",
                        "/send-reset-password-code",
                        "/oauth/github/authorize",
                        "/oauth/github/callback");
    }
}
