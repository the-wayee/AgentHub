package com.xiaoguai.agentx.domain.user.repository;


import com.xiaoguai.agentx.domain.user.model.UserEntity;
import com.xiaoguai.agentx.infrastrcture.domain.ExtraMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 12:15
 * @Description: UserRepository
 */
@Mapper
public interface UserRepository extends ExtraMapper<UserEntity> {
}
