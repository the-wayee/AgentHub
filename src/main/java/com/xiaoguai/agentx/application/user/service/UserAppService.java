package com.xiaoguai.agentx.application.user.service;


import com.xiaoguai.agentx.domain.user.model.UserEntity;
import com.xiaoguai.agentx.domain.user.service.UserDomainService;
import com.xiaoguai.agentx.infrastrcture.utils.JwtUtils;
import com.xiaoguai.agentx.interfaces.dto.user.req.LoginRequest;
import com.xiaoguai.agentx.interfaces.dto.user.req.RegisterRequest;
import org.springframework.stereotype.Service;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 12:17
 * @Description: UserAppService
 */
@Service
public class UserAppService {

    private final UserDomainService userDomainService;

    public UserAppService(UserDomainService userDomainService) {
        this.userDomainService = userDomainService;
    }

    /**
     * 登录
     */
    public String login(LoginRequest request) {
        UserEntity userEntity = userDomainService.login(request.getAccount(), request.getPassword());
        return JwtUtils.generateToken(userEntity.getId());
    }

    public void register(RegisterRequest request) {

    }
}
