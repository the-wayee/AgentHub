package com.xiaoguai.agentx.domain.user.service;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.domain.user.model.UserEntity;
import com.xiaoguai.agentx.domain.user.repository.UserRepository;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.utils.PasswordUtils;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 12:16
 * @Description: UserDomainService
 */
@Service
public class UserDomainService {

    private final UserRepository userRepository;

    public UserDomainService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    /**
     * 用户登录
     */
    public UserEntity login(String account, String password) {
        LambdaQueryWrapper<UserEntity> wrapper = Wrappers.<UserEntity>lambdaQuery()
                .eq(UserEntity::getEmail, account)
                .or()
                .eq(UserEntity::getPhone, account);
        UserEntity userEntity = userRepository.selectOne(wrapper);
        if (userEntity == null || !PasswordUtils.matches(password, userEntity.getPassword())) {
            throw new BusinessException("账号或密码错误");
        }
        return userEntity;
    }

    /**
     * 用户注册
     */
    public UserEntity register(String email, String phone, String password) {
        checkAccountValid(email, phone);

        UserEntity userEntity = new UserEntity();
        userEntity.setEmail(email);
        userEntity.setPhone(phone);

        userEntity.setPassword(PasswordUtils.encode(password));
        userEntity.valid();
        // 生成昵称
        userEntity.setNickname(generateNickname());
        userRepository.checkInsert(userEntity);
        return userEntity;
    }

    /**
     * 检查账号是否有效
     */
    public void checkAccountValid(String email, String phone) {
        LambdaQueryWrapper<UserEntity> wrapper = Wrappers.<UserEntity>lambdaQuery().eq(UserEntity::getEmail, email).or()
                .eq(UserEntity::getPhone, phone);
        if (userRepository.exists(wrapper)) {
            throw new BusinessException("账号已存在,不可重复账注册");
        }
    }

    /**
     * 根据账号查找用户
     * @param account 邮箱or手机号
     */
    public UserEntity findUserByAccount(String account) {
        LambdaQueryWrapper<UserEntity> wrapper = Wrappers.<UserEntity>lambdaQuery().eq(UserEntity::getEmail, account)
                .or().eq(UserEntity::getPhone, account);

        return userRepository.selectOne(wrapper);
    }

    private String generateNickname() {
        return "AgentHub-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
    }


}
