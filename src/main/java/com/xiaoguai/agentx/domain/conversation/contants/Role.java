package com.xiaoguai.agentx.domain.conversation.contants;


import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;

public enum Role {

    USER,
    SYSTEM,
    ASSISTANT;

    public static Role fromCode(String code) {
        for (Role role : values()) {
            if (role.name().equals(code)) {
                return role;
            }
        }
        throw new BusinessException("Unknown model type code: " + code);
    }
}
