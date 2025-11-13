package com.xiaoguai.agentx.application.knowledge.service;


import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xiaoguai.agentx.application.knowledge.assembler.KnowledgeFileAssembler;
import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeFileDTO;
import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeFileStatusEvent;
import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgeFileStatus;
import com.xiaoguai.agentx.domain.knowledge.model.KnowledgeEmbeddingEntity;
import com.xiaoguai.agentx.domain.knowledge.model.KnowledgeFileEntity;
import com.xiaoguai.agentx.domain.knowledge.repository.KnowledgeEmbeddingRepository;
import com.xiaoguai.agentx.domain.knowledge.repository.KnowledgeFileRepository;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import com.xiaoguai.agentx.infrastrcture.knowledge.document.DocumentProcessingService;
import com.xiaoguai.agentx.infrastrcture.knowledge.embedding.KnowledgeEmbeddingExecutor;
import com.xiaoguai.agentx.infrastrcture.s3.S3ObjectStorageService;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;

/**
 * Coordinates state transitions, parsing, splitting and embedding in an async pipeline.
 */
@Service
public class KnowledgeFileProcessingService {

    private static final Logger LOGGER = LoggerFactory.getLogger(KnowledgeFileProcessingService.class);

    private final ExecutorService executorService;
    private final KnowledgeFileRepository knowledgeFileRepository;
    private final KnowledgeEmbeddingRepository knowledgeEmbeddingRepository;
    private final DocumentProcessingService documentProcessingService;
    private final KnowledgeEmbeddingExecutor embeddingExecutor;
    private final S3ObjectStorageService storageService;
    private final KnowledgeFileEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    public KnowledgeFileProcessingService(ExecutorService executorService,
                                          KnowledgeFileRepository knowledgeFileRepository,
                                          KnowledgeEmbeddingRepository knowledgeEmbeddingRepository,
                                          DocumentProcessingService documentProcessingService,
                                          KnowledgeEmbeddingExecutor embeddingExecutor,
                                          S3ObjectStorageService storageService,
                                          KnowledgeFileEventPublisher eventPublisher,
                                          ObjectMapper objectMapper) {
        this.executorService = executorService;
        this.knowledgeFileRepository = knowledgeFileRepository;
        this.knowledgeEmbeddingRepository = knowledgeEmbeddingRepository;
        this.documentProcessingService = documentProcessingService;
        this.embeddingExecutor = embeddingExecutor;
        this.storageService = storageService;
        this.eventPublisher = eventPublisher;
        this.objectMapper = objectMapper;
    }

    /**
     * Adds the file to executor queue and immediately notifies subscribers.
     */
    public void enqueue(KnowledgeFileEntity fileEntity) {
        KnowledgeFileStatus status = fileEntity.getStatus() != null ? fileEntity.getStatus() : KnowledgeFileStatus.PENDING;
        KnowledgeFileStatusEvent event = buildEvent(fileEntity.getId(), status, 0, "等待处理");
        eventPublisher.publish(event);
        executorService.submit(() -> process(fileEntity.getId()));
    }

    private void process(String fileId) {
        if (!transition(fileId, KnowledgeFileStatus.PENDING, KnowledgeFileStatus.PROCESSING)) {
            LOGGER.info("Skip knowledge file {} because status is not PENDING", fileId);
            return;
        }
        eventPublisher.publish(buildEvent(fileId, KnowledgeFileStatus.PROCESSING, 10, "开始解析文件"));
        KnowledgeFileEntity file = knowledgeFileRepository.selectById(fileId);
        if (file == null) {
            LOGGER.warn("Knowledge file {} removed before processing", fileId);
            return;
        }
        String objectKey = storageService.extractObjectKey(file.getFilePath());
        try (InputStream inputStream = storageService.openStream(objectKey)) {
            List<TextSegment> segments = documentProcessingService.parseAndSplit(
                    inputStream,
                    file.getFileType()
            );
            if (segments.isEmpty()) {
                throw new BusinessException("未在文件中解析到可用文本");
            }
            eventPublisher.publish(buildEvent(fileId, KnowledgeFileStatus.PROCESSING, 40, "拆分完成,开始嵌入"));

            List<Embedding> embeddings = embeddingExecutor.embedAll(segments);
            persistEmbeddings(fileId, segments, embeddings);
            updateChunkCount(fileId, embeddings.size());
            if (!transition(fileId, KnowledgeFileStatus.PROCESSING, KnowledgeFileStatus.COMPLETED)) {
                LOGGER.warn("Failed to mark knowledge file {} as COMPLETED", fileId);
            }
            eventPublisher.publish(buildEvent(fileId, KnowledgeFileStatus.COMPLETED, 100, "处理完成"));
        } catch (Exception ex) {
            LOGGER.error("Failed to process knowledge file {}", fileId, ex);
            markFailed(fileId, ex.getMessage());
        }
    }

    private void persistEmbeddings(String fileId, List<TextSegment> segments, List<Embedding> embeddings) {
        if (embeddings.size() != segments.size()) {
            throw new BusinessException("嵌入数量与文本分块数量不一致");
        }
        knowledgeEmbeddingRepository.delete(
                Wrappers.<KnowledgeEmbeddingEntity>lambdaQuery().eq(KnowledgeEmbeddingEntity::getFileId, fileId)
        );
        List<KnowledgeEmbeddingEntity> batch = new ArrayList<>();
        for (int i = 0; i < embeddings.size(); i++) {
            Embedding embedding = embeddings.get(i);
            TextSegment segment = segments.get(i);
            KnowledgeEmbeddingEntity entity = new KnowledgeEmbeddingEntity();
            entity.setEmbeddingId(UUID.randomUUID().toString());
            entity.setFileId(fileId);
            entity.setText(segment.text());
            entity.setMetadata(segment.metadata() != null ? segment.metadata().toMap() : Map.of());
            entity.setEmbedding(writeVector(embedding.vectorAsList()));
            batch.add(entity);
        }
        for (KnowledgeEmbeddingEntity entity : batch) {
            knowledgeEmbeddingRepository.checkInsert(entity);
        }
    }

    private void updateChunkCount(String fileId, int chunkCount) {
        LambdaUpdateWrapper<KnowledgeFileEntity> wrapper = Wrappers.<KnowledgeFileEntity>lambdaUpdate()
                .eq(KnowledgeFileEntity::getId, fileId)
                .set(KnowledgeFileEntity::getChunkCount, chunkCount)
                .set(KnowledgeFileEntity::getUpdatedAt, LocalDateTime.now());
        knowledgeFileRepository.update(null, wrapper);
    }

    private void markFailed(String fileId, String errorMessage) {
        transitionToFailed(fileId);
        String message = (errorMessage == null || errorMessage.isBlank()) ? "处理失败" : errorMessage;
        eventPublisher.publish(buildEvent(fileId, KnowledgeFileStatus.FAILED, 0, message));
    }

    private boolean transition(String fileId, KnowledgeFileStatus expected, KnowledgeFileStatus target) {
        LambdaUpdateWrapper<KnowledgeFileEntity> wrapper = Wrappers.<KnowledgeFileEntity>lambdaUpdate()
                .eq(KnowledgeFileEntity::getId, fileId)
                .eq(KnowledgeFileEntity::getStatus, expected)
                .set(KnowledgeFileEntity::getStatus, target)
                .set(KnowledgeFileEntity::getUpdatedAt, LocalDateTime.now());
        return knowledgeFileRepository.update(null, wrapper) > 0;
    }

    private void transitionToFailed(String fileId) {
        LambdaUpdateWrapper<KnowledgeFileEntity> wrapper = Wrappers.<KnowledgeFileEntity>lambdaUpdate()
                .eq(KnowledgeFileEntity::getId, fileId)
                .in(KnowledgeFileEntity::getStatus, KnowledgeFileStatus.PENDING, KnowledgeFileStatus.PROCESSING)
                .set(KnowledgeFileEntity::getStatus, KnowledgeFileStatus.FAILED)
                .set(KnowledgeFileEntity::getUpdatedAt, LocalDateTime.now());
        knowledgeFileRepository.update(null, wrapper);
    }

    private KnowledgeFileStatusEvent buildEvent(String fileId, KnowledgeFileStatus status, int progress, String message) {
        KnowledgeFileStatusEvent event = new KnowledgeFileStatusEvent();
        event.setFileId(fileId);
        event.setStatus(status);
        event.setProgress(progress);
        event.setMessage(message);
        event.setTimestamp(LocalDateTime.now());
        return event;
    }

    private String writeVector(List<Float> vector) {
        try {
            return objectMapper.writeValueAsString(vector);
        } catch (JsonProcessingException ex) {
            throw new BusinessException("向量序列化失败: " + ex.getMessage());
        }
    }

    public KnowledgeFileDTO getFile(String fileId) {
        KnowledgeFileEntity entity = knowledgeFileRepository.selectById(fileId);
        if (entity == null) {
            throw new BusinessException("知识文件不存在");
        }
        return KnowledgeFileAssembler.toDTO(entity);
    }
}
