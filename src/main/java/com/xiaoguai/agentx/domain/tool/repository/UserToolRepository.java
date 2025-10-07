package com.xiaoguai.agentx.domain.tool.repository;


import com.xiaoguai.agentx.domain.tool.model.UserToolEntity;
import com.xiaoguai.agentx.infrastrcture.domain.ExtraMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 20:12
 * @Description: UserToolRepository
 */
@Mapper
public interface UserToolRepository extends ExtraMapper<UserToolEntity> {
}
