package com.xiaoguai.agentx.domain.llm.repository;


import com.xiaoguai.agentx.domain.llm.model.ModelEntity;
import com.xiaoguai.agentx.infrastrcture.domain.ExtraMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 09:45
 * @Description: 模型仓储
 */
@Mapper
public interface ModelRepository extends ExtraMapper<ModelEntity> {
}
