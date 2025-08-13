package com.xiaoguai.agentx.domain.llm.repository;


import com.xiaoguai.agentx.domain.llm.model.ProviderEntity;
import com.xiaoguai.agentx.infrastrcture.domain.ExtraMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 09:46
 * @Description: 服务提供商仓储
 */
@Mapper
public interface ProviderRepository extends ExtraMapper<ProviderEntity> {
}
