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
        registry.addInterceptor(userAuthInterceptor);
//                // 添加拦截路径 - 拦截所有API请求
//                .addPathPatterns("/api/**")
//                // 排除不需要鉴权的路径，例如登录、注册等
//                .excludePathPatterns("/api/auth/login", "/api/auth/register");
    }
}
