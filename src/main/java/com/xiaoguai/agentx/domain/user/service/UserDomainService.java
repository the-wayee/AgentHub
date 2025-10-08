package com.xiaoguai.agentx.domain.user.service;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.domain.tool.model.UserToolEntity;
import com.xiaoguai.agentx.domain.tool.repository.UserToolRepository;
import com.xiaoguai.agentx.domain.user.model.UserEntity;
import com.xiaoguai.agentx.domain.user.repository.UserRepository;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.utils.PasswordUtils;
import com.xiaoguai.agentx.interfaces.api.common.Result;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

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
     *
     * @param account 邮箱or手机号
     */
    public UserEntity findUserByAccount(String account) {
        LambdaQueryWrapper<UserEntity> wrapper = Wrappers.<UserEntity>lambdaQuery().eq(UserEntity::getEmail, account)
                .or().eq(UserEntity::getPhone, account);
        UserEntity user = userRepository.selectOne(wrapper);
        if (user == null) {
            throw new BusinessException("用户不存在：" + account);
        }
        return user;
    }

    /**
     * 更新用户密码
     */
    public void updateUserPassword(UserEntity user, String newPassword) {
        user.setPassword(PasswordUtils.encode(newPassword));

        userRepository.checkUpdateById(user);
    }

    /**
     * 根据id查找用户
     */
    public UserEntity getUserById(String userId) {
        UserEntity userEntity = userRepository.selectById(userId);
        if (userEntity == null) {
            throw new BusinessException("用户不存在：" + userId);

        }
        return userEntity;
    }

    public Map<String, UserEntity> getUsers(List<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        LambdaQueryWrapper<UserEntity> wrapper = Wrappers.<UserEntity>lambdaQuery()
                .in(UserEntity::getId, userIds);
        return userRepository.selectList(wrapper)
                .stream()
                .collect(Collectors.toMap(UserEntity::getId, Function.identity()));
    }

    private String generateNickname() {
        return "AgentHub-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
    }


}
