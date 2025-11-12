package com.xiaoguai.agentx.domain.knowledge.service;

import com.xiaoguai.agentx.domain.knowledge.model.KnowledgeBaseEntity;
import com.xiaoguai.agentx.domain.knowledge.repository.KnowledgeBaseRepository;
import org.springframework.stereotype.Service;

@Service
public class KnowledgeDomainService {

    private final KnowledgeBaseRepository knowledgeBaseRepository;

    public KnowledgeDomainService(KnowledgeBaseRepository knowledgeBaseRepository) {
        this.knowledgeBaseRepository = knowledgeBaseRepository;
    }

    public KnowledgeBaseEntity createKnowledge(KnowledgeBaseEntity entity) {
        knowledgeBaseRepository.checkInsert(entity);
        return entity;
    }

    public KnowledgeBaseEntity updateKnowLedge(KnowledgeBaseEntity entity) {
        knowledgeBaseRepository.checkUpdateById(entity);
        return entity;
    }
}
