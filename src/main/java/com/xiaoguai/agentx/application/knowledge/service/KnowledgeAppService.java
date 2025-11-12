package com.xiaoguai.agentx.application.knowledge.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xiaoguai.agentx.application.knowledge.KnowledgeAssembler;
import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeBaseDTO;
import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeFileDTO;
import com.xiaoguai.agentx.application.knowledge.dto.KnowledgePublishRecordDTO;
import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgeBaseStatus;
import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgePublishStatus;
import com.xiaoguai.agentx.domain.knowledge.model.KnowledgeBaseEntity;
import com.xiaoguai.agentx.domain.knowledge.model.KnowledgeFileEntity;
import com.xiaoguai.agentx.domain.knowledge.model.KnowledgePublishRecordEntity;
import com.xiaoguai.agentx.domain.knowledge.repository.KnowledgeBaseRepository;
import com.xiaoguai.agentx.domain.knowledge.repository.KnowledgeFileRepository;
import com.xiaoguai.agentx.domain.knowledge.repository.KnowledgePublishRecordRepository;
import com.xiaoguai.agentx.domain.knowledge.service.KnowledgeDomainService;
import com.xiaoguai.agentx.infrastrcture.exception.EntityNotFoundException;
import com.xiaoguai.agentx.interfaces.dto.knowledge.CreateKnowledgeBaseRequest;
import com.xiaoguai.agentx.interfaces.dto.knowledge.CreateKnowledgeFileRequest;
import com.xiaoguai.agentx.interfaces.dto.knowledge.ReviewPublishRequest;
import com.xiaoguai.agentx.interfaces.dto.knowledge.SubmitPublishRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class KnowledgeAppService {

    private final KnowledgeDomainService knowledgeDomainService;

    public KnowledgeAppService(KnowledgeDomainService knowledgeDomainService, KnowledgeBaseRepository knowledgeBaseRepository,
                               KnowledgeFileRepository knowledgeFileRepository,
                               KnowledgePublishRecordRepository publishRecordRepository) {
        this.knowledgeDomainService = knowledgeDomainService;
    }

    @Transactional(rollbackFor = Exception.class)
    public KnowledgeBaseDTO createKnowledgeBase(CreateKnowledgeBaseRequest request, String userId) {
        KnowledgeBaseEntity entity = new KnowledgeBaseEntity();
        entity.setUserId(userId);
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setStatus(KnowledgeBaseStatus.DRAFT);
        knowledgeDomainService.createKnowledge(entity);
        return KnowledgeAssembler.toDTO((entity));
    }

    public List<KnowledgeBaseDTO> listMyKnowledges(String userId) {
        return new ArrayList<>();
    }

    public List<KnowledgeBaseDTO> listPublicKnowledgeBases() {
        return new ArrayList<>();
    }

    @Transactional(rollbackFor = Exception.class)
    public KnowledgeFileDTO createKnowledgeFile(CreateKnowledgeFileRequest request, String userId) {
        KnowledgeBaseEntity kb = new KnowledgeBaseEntity();
        if (kb == null || !Objects.equals(kb.getUserId(), userId)) {
            throw new EntityNotFoundException("知识库不存在或无权限");
        }
        KnowledgeFileEntity file = new KnowledgeFileEntity();
        file.setKnowledgeBaseId(request.getKnowledgeBaseId());
        file.setFileName(request.getFileName());
        file.setFilePath(request.getFilePath());
        file.setFileType(request.getFileType());
        file.setFileSize(request.getFileSize());
        // todo insert
        return null;
    }

    public List<KnowledgeFileDTO> listKnowledgeFiles(String kbId, String userId) {
        return new ArrayList<>();
    }

    @Transactional(rollbackFor = Exception.class)
    public KnowledgePublishRecordDTO submitPublish(SubmitPublishRequest request, String userId) {
        return null;
    }

    @Transactional(rollbackFor = Exception.class)
    public void reviewPublish(ReviewPublishRequest request, String reviewerId) {

    }



    private KnowledgePublishRecordDTO toDTO(KnowledgePublishRecordEntity e) {
        KnowledgePublishRecordDTO dto = new KnowledgePublishRecordDTO();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setDescription(e.getDescription());
        dto.setKnowledgeBaseId(e.getKnowledgeBaseId());
        dto.setVersionNumber(e.getVersionNumber());
        dto.setSubmitterId(e.getSubmitterId());
        dto.setReviewerId(e.getReviewerId());
        dto.setStatus(e.getStatus());
        dto.setRejectReason(e.getRejectReason());
        dto.setChangeLog(e.getChangeLog());
        dto.setReviewedAt(e.getReviewedAt());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setUpdatedAt(e.getUpdatedAt());
        return dto;
    }
}

