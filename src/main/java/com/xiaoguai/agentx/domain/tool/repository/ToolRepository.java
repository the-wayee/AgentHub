package com.xiaoguai.agentx.domain.tool.repository;


import com.xiaoguai.agentx.domain.tool.model.ToolEntity;
import com.xiaoguai.agentx.infrastrcture.domain.ExtraMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 20:11
 * @Description: 工具仓储接口
 */
@Mapper
public interface ToolRepository extends ExtraMapper<ToolEntity> {
}
