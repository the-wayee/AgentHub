package com.xiaoguai.agentx.interfaces.dto.user.req;


import jakarta.validation.constraints.Email;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 12:42
 * @Description: RegisterRequest
 */
public class RegisterRequest {

    @Email(message = "不是合法邮箱")
    private String email;

    private String phone;

    private String password;

    // 验证码
    private String code;

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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
