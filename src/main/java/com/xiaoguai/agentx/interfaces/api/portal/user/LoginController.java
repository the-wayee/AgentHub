package com.xiaoguai.agentx.interfaces.api.portal.user;


import com.xiaoguai.agentx.application.user.service.UserAppService;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.user.req.LoginRequest;
import com.xiaoguai.agentx.interfaces.dto.user.req.RegisterRequest;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 12:16
 * @Description: LoginController
 */
@RestController
@RequestMapping
public class LoginController {

    private final UserAppService  userAppService;

    public LoginController(UserAppService userAppService) {
        this.userAppService = userAppService;
    }

    /**
     * 登录接口
     * @return token
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody @Validated LoginRequest request) {
        String token = userAppService.login(request);
        return Result.success("登录成功", Map.of("token", token));
    }

    @PostMapping("/register")
    public Result<?> register(@RequestBody @Validated RegisterRequest request) {
        userAppService.register(request);
        return Result.success().message("注册成功");
    }
}
