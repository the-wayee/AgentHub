package com.xiaoguai.agentx.domain.user.model;


import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.xiaoguai.agentx.infrastrcture.entity.BaseEntity;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 12:14
 * @Description: UserEntity
 */
@TableName("users")
public class UserEntity extends BaseEntity {
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    private String nickname;
    private String email;
    private String phone;
    private String password;
    private String githubId;
    private String githubLogin;
    private String avatarUrl;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getGithubId() {
        return githubId;
    }

    public void setGithubId(String githubId) {
        this.githubId = githubId;
    }

    public String getGithubLogin() {
        return githubLogin;
    }

    public void setGithubLogin(String githubLogin) {
        this.githubLogin = githubLogin;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    public void valid() {
        if (StringUtils.isEmpty(email) && StringUtils.isEmpty(phone) && StringUtils.isEmpty(githubId)) {
            throw new BusinessException("必须使用邮箱、手机号或GitHub账号来作为账号");
        }
    }

}

