package com.xiaoguai.agentx.domain.tool.repository;


import com.xiaoguai.agentx.domain.tool.model.ToolVersionEntity;
import com.xiaoguai.agentx.infrastrcture.domain.ExtraMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 20:11
 * @Description: ToolVersionRepository
 */
@Mapper
public interface ToolVersionRepository extends ExtraMapper<ToolVersionEntity> {
}
