package com.xiaoguai.agentx.interfaces.dto.user.req;


import jakarta.validation.constraints.NotBlank;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 12:34
 * @Description: 登录请求
 */
public class LoginRequest {

    @NotBlank(message = "账号不能为空")
    private String account;

    @NotBlank(message = "密码不能为空")
    private String password;

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
