package com.xiaoguai.agentx.interfaces.api.portal.user;


import com.xiaoguai.agentx.application.user.service.LoginAppService;
import com.xiaoguai.agentx.infrastrcture.verification.CaptchaUtils;
import com.xiaoguai.agentx.infrastrcture.verification.CaptchaUtils.CaptchaResult;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import com.xiaoguai.agentx.interfaces.dto.user.req.*;
import com.xiaoguai.agentx.interfaces.dto.user.resp.CaptchaResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotNull;
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

    private final LoginAppService loginAppService;

    public LoginController(LoginAppService loginAppService) {
        this.loginAppService = loginAppService;
    }

    /**
     * 登录
     *
     * @return token
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody @Validated LoginRequest request) {
        String token = loginAppService.login(request);
        return Result.success("登录成功", Map.of("token", token));
    }

    /**
     * 注册
     */
    @PostMapping("/register")
    public Result<?> register(@RequestBody @Validated RegisterRequest request) {
        loginAppService.register(request);
        return Result.success().message("注册成功");
    }


    /**
     * 获取图形验证码
     */
    @GetMapping("/get-captcha")
    public Result<CaptchaResponse> getCaptcha() {
        CaptchaResult captchaResult = CaptchaUtils.generateCaptcha();

        CaptchaResponse response = new CaptchaResponse(captchaResult.getUuid(), captchaResult.getImageBase64());
        return Result.success(response);
    }

    /**
     * 请求发送邮箱验证码
     */
    @PostMapping("/send-email-code")
    public Result<?> sendEmailCode(@RequestBody @Validated SendEmailCodeRequest request, HttpServletRequest httpRequest) {
        // 获取客户端IP
        String clientIp = getClientIp(httpRequest);

        loginAppService.sendEmailVerificationCode(request, clientIp);
        return Result.success().message("验证码已发送，请查收邮件");
    }

    /**
     * 发送重置密码验证码
     *
     * @param request
     * @param httpRequest
     * @return
     */
    @PostMapping("/send-reset-password-code")
    public Result<?> sendResetPasswordCode(@RequestBody @Validated SendResetPasswordCodeRequest request, HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        loginAppService.sendResetPasswordCode(request, clientIp);
        return Result.success().message("验证码已发送，请查收邮件");
    }

    /**
     * 重置密码
     */
    @PostMapping("/reset-password")
    public Result<?> resetPassword(@RequestBody @Validated ResetPasswordRequest request) {
        loginAppService.resetPassword(request);
        return Result.success();
    }

    /**
     * 判断账号是否可用
     * @param account
     * @return
     */
    @GetMapping("/account-available")
    public Result<Boolean> checkAccountAvailable(@RequestParam @NotNull String account) {
        boolean available = loginAppService.checkAccountAvailable(account);
        if (available) {
            return Result.success("该账号可用", available);
        } else {
            return Result.success("该账号已被占用", available);
        }
    }


    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // 对于通过多个代理的情况，第一个IP为客户端真实IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        return ip;
    }
}
