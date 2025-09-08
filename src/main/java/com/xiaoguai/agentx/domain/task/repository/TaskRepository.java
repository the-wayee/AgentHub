package com.xiaoguai.agentx.domain.task.repository;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaoguai.agentx.domain.task.model.TaskEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-08 11:41
 * @Description: TaskRepository
 */
@Mapper
public interface TaskRepository extends BaseMapper<TaskEntity> {
}
