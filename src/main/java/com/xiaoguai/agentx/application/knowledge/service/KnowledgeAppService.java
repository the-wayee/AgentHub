package com.xiaoguai.agentx.application.knowledge.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xiaoguai.agentx.application.knowledge.KnowledgeAssembler;
import com.xiaoguai.agentx.application.knowledge.assembler.KnowledgeFileAssembler;
import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeBaseDTO;
import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeFileDTO;
import com.xiaoguai.agentx.application.knowledge.dto.KnowledgePublishRecordDTO;
import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgeBaseStatus;
import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgeFileStatus;
import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgePublishStatus;
import com.xiaoguai.agentx.domain.knowledge.constants.Visibility;
import com.xiaoguai.agentx.domain.knowledge.model.KnowledgeBaseEntity;
import com.xiaoguai.agentx.domain.knowledge.model.KnowledgeFileEntity;
import com.xiaoguai.agentx.domain.knowledge.model.KnowledgePublishRecordEntity;
import com.xiaoguai.agentx.domain.knowledge.repository.KnowledgeBaseRepository;
import com.xiaoguai.agentx.domain.knowledge.repository.KnowledgeFileRepository;
import com.xiaoguai.agentx.domain.knowledge.repository.KnowledgePublishRecordRepository;
import com.xiaoguai.agentx.domain.knowledge.service.KnowledgeDomainService;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.exception.EntityNotFoundException;
import com.xiaoguai.agentx.infrastrcture.s3.S3ObjectReference;
import com.xiaoguai.agentx.infrastrcture.s3.S3ObjectStorageService;
import com.xiaoguai.agentx.interfaces.dto.knowledge.CreateKnowledgeBaseRequest;
import com.xiaoguai.agentx.interfaces.dto.knowledge.CreateKnowledgeFileRequest;
import com.xiaoguai.agentx.interfaces.dto.knowledge.ReviewPublishRequest;
import com.xiaoguai.agentx.interfaces.dto.knowledge.SubmitPublishRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class KnowledgeAppService {

    private static final long MAX_UPLOAD_SIZE_BYTES = 20L * 1024 * 1024;

    private final KnowledgeDomainService knowledgeDomainService;
    private final KnowledgeBaseRepository knowledgeBaseRepository;
    private final KnowledgeFileRepository knowledgeFileRepository;
    private final KnowledgePublishRecordRepository knowledgePublishRecordRepository;
    private final KnowledgeFileProcessingService knowledgeFileProcessingService;
    private final S3ObjectStorageService storageService;

    public KnowledgeAppService(KnowledgeDomainService knowledgeDomainService, KnowledgeBaseRepository knowledgeBaseRepository,
                               KnowledgeFileRepository knowledgeFileRepository,
                               KnowledgePublishRecordRepository publishRecordRepository,
                               KnowledgeFileProcessingService knowledgeFileProcessingService,
                               S3ObjectStorageService storageService) {
        this.knowledgeDomainService = knowledgeDomainService;
        this.knowledgeBaseRepository = knowledgeBaseRepository;
        this.knowledgeFileRepository = knowledgeFileRepository;
        this.knowledgePublishRecordRepository = publishRecordRepository;
        this.knowledgeFileProcessingService = knowledgeFileProcessingService;
        this.storageService = storageService;
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
        return knowledgeBaseRepository.selectList(
                Wrappers.<KnowledgeBaseEntity>lambdaQuery()
                        .eq(KnowledgeBaseEntity::getUserId, userId)
                        .orderByDesc(KnowledgeBaseEntity::getUpdatedAt)
        ).stream().map(KnowledgeAssembler::toDTO).toList();
    }

    public List<KnowledgeBaseDTO> listPublicKnowledgeBases() {
        return knowledgeBaseRepository.selectList(
                Wrappers.<KnowledgeBaseEntity>lambdaQuery()
                        .eq(KnowledgeBaseEntity::getVisibility, Visibility.PUBLIC)
                        .eq(KnowledgeBaseEntity::getStatus, KnowledgeBaseStatus.APPROVED)
                        .orderByDesc(KnowledgeBaseEntity::getPublishedAt)
        ).stream().map(KnowledgeAssembler::toDTO).toList();
    }

    @Transactional(rollbackFor = Exception.class)
    public KnowledgeFileDTO createKnowledgeFile(CreateKnowledgeFileRequest request, String userId) {
        KnowledgeBaseEntity kb = getOwnedKnowledgeBase(request.getKnowledgeBaseId(), userId);
        if (request.getFileSize() != null) {
            validateFileSize(request.getFileSize());
        }
        KnowledgeFileEntity file = new KnowledgeFileEntity();
        file.setKnowledgeBaseId(kb.getId());
        file.setFileName(request.getFileName());
        file.setFilePath(request.getFilePath());
        file.setFileType(request.getFileType());
        file.setFileSize(request.getFileSize());
        file.setStatus(KnowledgeFileStatus.PENDING);
        knowledgeFileRepository.checkInsert(file);
        knowledgeFileProcessingService.enqueue(file);
        return KnowledgeFileAssembler.toDTO(file);
    }

    @Transactional(rollbackFor = Exception.class)
    public KnowledgeFileDTO uploadKnowledgeFile(String knowledgeBaseId, MultipartFile multipartFile, String userId) {
        KnowledgeBaseEntity kb = getOwnedKnowledgeBase(knowledgeBaseId, userId);
        if (multipartFile.isEmpty()) {
            throw new BusinessException("文件不能为空");
        }
        validateFileSize(multipartFile.getSize());
        String directory = "knowledge/" + knowledgeBaseId;
        S3ObjectReference reference = storageService.upload(directory, multipartFile);
        KnowledgeFileEntity file = new KnowledgeFileEntity();
        file.setKnowledgeBaseId(kb.getId());
        file.setFileName(reference.getFileName());
        file.setFilePath(reference.getFileUrl());
        file.setFileType(resolveFileType(reference.getFileName()));
        file.setFileSize(reference.getSize());
        file.setStatus(KnowledgeFileStatus.UPLOADING);
        knowledgeFileRepository.checkInsert(file);
        knowledgeFileProcessingService.enqueue(file);
        return KnowledgeFileAssembler.toDTO(file);
    }

    public List<KnowledgeFileDTO> listKnowledgeFiles(String kbId, String userId) {
        KnowledgeBaseEntity kb = getOwnedKnowledgeBase(kbId, userId);
        return knowledgeFileRepository.selectList(
                Wrappers.<KnowledgeFileEntity>lambdaQuery()
                        .eq(KnowledgeFileEntity::getKnowledgeBaseId, kb.getId())
                        .orderByDesc(KnowledgeFileEntity::getCreatedAt)
        ).stream().map(KnowledgeFileAssembler::toDTO).toList();
    }

    @Transactional(rollbackFor = Exception.class)
    public KnowledgePublishRecordDTO submitPublish(SubmitPublishRequest request, String userId) {
        KnowledgeBaseEntity kb = getOwnedKnowledgeBase(request.getKnowledgeBaseId(), userId);
        KnowledgePublishRecordEntity record = new KnowledgePublishRecordEntity();
        record.setName(kb.getName());
        record.setDescription(kb.getDescription());
        record.setKnowledgeBaseId(kb.getId());
        record.setVersionNumber(resolveVersionNumber(request.getVersionNumber()));
        record.setSubmitterId(userId);
        record.setChangeLog(request.getChangeLog());
        record.setStatus(KnowledgePublishStatus.REVIEWING);
        knowledgePublishRecordRepository.checkInsert(record);

        kb.setStatus(KnowledgeBaseStatus.SUBMITTED);
        kb.setPublishRecordId(record.getId());
        knowledgeDomainService.updateKnowLedge(kb);
        return toDTO(record);
    }

    @Transactional(rollbackFor = Exception.class)
    public void reviewPublish(ReviewPublishRequest request, String reviewerId) {
        KnowledgePublishRecordEntity record = knowledgePublishRecordRepository.selectById(request.getRecordId());
        if (record == null) {
            throw new EntityNotFoundException("发布记录不存在");
        }
        if (record.getStatus() != KnowledgePublishStatus.REVIEWING) {
            throw new BusinessException("当前发布记录已审核");
        }
        KnowledgeBaseEntity kb = knowledgeBaseRepository.selectById(record.getKnowledgeBaseId());
        if (kb == null) {
            throw new EntityNotFoundException("关联的知识库不存在");
        }

        record.setReviewerId(reviewerId);
        record.setReviewedAt(LocalDateTime.now());
        if (request.isApprove()) {
            record.setStatus(KnowledgePublishStatus.APPROVED);
            record.setRejectReason(null);
            kb.setStatus(KnowledgeBaseStatus.APPROVED);
            kb.setPublishRecordId(record.getId());
            kb.setPublishedAt(LocalDateTime.now());
        } else {
            if (!StringUtils.hasText(request.getRejectReason())) {
                throw new BusinessException("请填写拒绝原因");
            }
            record.setStatus(KnowledgePublishStatus.REJECTED);
            record.setRejectReason(request.getRejectReason());
            kb.setStatus(KnowledgeBaseStatus.REJECTED);
        }
        knowledgePublishRecordRepository.checkUpdateById(record);
        knowledgeDomainService.updateKnowLedge(kb);
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

    private KnowledgeBaseEntity getOwnedKnowledgeBase(String knowledgeBaseId, String userId) {
        KnowledgeBaseEntity kb = knowledgeBaseRepository.selectById(knowledgeBaseId);
        if (kb == null || !Objects.equals(kb.getUserId(), userId)) {
            throw new EntityNotFoundException("知识库不存在或无权限");
        }
        return kb;
    }

    private void validateFileSize(long size) {
        if (size > MAX_UPLOAD_SIZE_BYTES) {
            throw new BusinessException("文件大小超过20MB限制");
        }
    }

    private String resolveFileType(String fileName) {
        String extension = StringUtils.getFilenameExtension(fileName);
        return extension != null ? extension.toLowerCase(Locale.ROOT) : "txt";
    }

    private String resolveVersionNumber(String versionNumber) {
        return StringUtils.hasText(versionNumber) ? versionNumber : "v1.0";
    }
}
