package com.xiaoguai.agentx.domain.knowledge.repository;

import com.xiaoguai.agentx.domain.knowledge.model.KnowledgeBaseEntity;
import com.xiaoguai.agentx.infrastrcture.domain.ExtraMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface KnowledgeBaseRepository extends ExtraMapper<KnowledgeBaseEntity> {
}

