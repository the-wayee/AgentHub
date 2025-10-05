package com.xiaoguai.agentx.application.user.service;


import com.xiaoguai.agentx.domain.user.model.UserEntity;
import com.xiaoguai.agentx.domain.user.service.UserDomainService;
import com.xiaoguai.agentx.infrastrcture.email.EmailService;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.utils.JwtUtils;
import com.xiaoguai.agentx.infrastrcture.verification.CaptchaUtils;
import com.xiaoguai.agentx.infrastrcture.verification.VerificationCodeService;
import com.xiaoguai.agentx.interfaces.dto.user.req.LoginRequest;
import com.xiaoguai.agentx.interfaces.dto.user.req.RegisterRequest;
import com.xiaoguai.agentx.interfaces.dto.user.req.SendEmailCodeRequest;
import com.xiaoguai.agentx.interfaces.dto.user.req.SendResetPasswordCodeRequest;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Service;

import static com.xiaoguai.agentx.infrastrcture.verification.VerificationCodeService.BUSINESS_TYPE_RESET_PASSWORD;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 12:17
 * @Description: UserAppService
 */
@Service
public class LoginAppService {

    private final UserDomainService userDomainService;
    private final VerificationCodeService verificationCodeService;
    private final EmailService emailService;

    public LoginAppService(UserDomainService userDomainService, VerificationCodeService verificationCodeService, EmailService emailService) {
        this.userDomainService = userDomainService;
        this.verificationCodeService = verificationCodeService;
        this.emailService = emailService;
    }

    /**
     * 登录
     */
    public String login(LoginRequest request) {
        UserEntity userEntity = userDomainService.login(request.getAccount(), request.getPassword());
        return JwtUtils.generateToken(userEntity.getId());
    }

    public void register(RegisterRequest request) {
        // 邮箱注册
        if (request.getEmail() != null) {
            if (request.getCode() == null) {
                throw new BusinessException("邮箱注册需要验证码");
            }

            // 验证验证码是否正确
            boolean isValid = verificationCodeService.verifyCode(request.getEmail(), request.getCode());
            if (!isValid) {
                throw new BusinessException("验证码无效或已过期");
            }
        }

        userDomainService.register(request.getEmail(), request.getPhone(), request.getPassword());
    }

    /**
     * 发送验证码
     */
    public void sendEmailVerificationCode(SendEmailCodeRequest request, String clientIp) {
        // 检查邮箱是否已存在
        userDomainService.checkAccountValid(request.getEmail(), null);

        // 生成验证码
        String code = verificationCodeService.generateCode(request.getEmail(), request.getCaptchaUuid(), request.getCaptchaCode(), clientIp);

        // 发送邮箱验证码
        emailService.sendVerificationEmail(request.getEmail(), code);
    }


    /**
     * 发送重置密码邮件验证码
     */
    public void sendResetPasswordCode(SendResetPasswordCodeRequest request, String clientIp) {
        // 检查邮件是否存在
        UserEntity account = userDomainService.findUserByAccount(request.getEmail());
        if (account == null) {
            throw new BusinessException("该邮箱未注册");
        }

        // 生成验证码
        String code = verificationCodeService.generateCode(request.getEmail(), request.getCaptchaUuid(), request.getCaptchaCode(), clientIp, BUSINESS_TYPE_RESET_PASSWORD);

        // 发送邮箱验证码
        emailService.sendVerificationEmail(request.getEmail(), code);
    }

    public boolean checkAccountAvailable(String account) {
        UserEntity user = userDomainService.findUserByAccount(account);
        return user == null;
    }
}
