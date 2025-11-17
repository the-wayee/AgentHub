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
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

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
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final TransactionTemplate transactionTemplate;

    public KnowledgeFileProcessingService(ExecutorService executorService,
                                          KnowledgeFileRepository knowledgeFileRepository,
                                          KnowledgeEmbeddingRepository knowledgeEmbeddingRepository,
                                          DocumentProcessingService documentProcessingService,
                                          KnowledgeEmbeddingExecutor embeddingExecutor,
                                          S3ObjectStorageService storageService,
                                          KnowledgeFileEventPublisher eventPublisher,
                                          ObjectMapper objectMapper,
                                          EmbeddingStore<TextSegment> embeddingStore,
                                          TransactionTemplate transactionTemplate) {
        this.executorService = executorService;
        this.knowledgeFileRepository = knowledgeFileRepository;
        this.knowledgeEmbeddingRepository = knowledgeEmbeddingRepository;
        this.documentProcessingService = documentProcessingService;
        this.embeddingExecutor = embeddingExecutor;
        this.storageService = storageService;
        this.eventPublisher = eventPublisher;
        this.objectMapper = objectMapper;
        this.embeddingStore = embeddingStore;
        this.transactionTemplate = transactionTemplate;
    }

    /**
     * Adds the file to executor queue and immediately notifies subscribers.
     */
    public void enqueue(KnowledgeFileEntity fileEntity) {
        KnowledgeFileStatus status = fileEntity.getStatus() != null ? fileEntity.getStatus() : KnowledgeFileStatus.PENDING;
        eventPublisher.publish(buildEvent(fileEntity.getId(), status, 0, "等待任务执行"));
        executorService.submit(() -> processSplittingStage(fileEntity.getId()));
    }

    /**
     * Stage 1: 文档拆分
     */
    private void processSplittingStage(String fileId) {
        try {
            // 文件上传完成，转换拆分状态
            if (!transitionWithTx(fileId, KnowledgeFileStatus.SPLITTING, KnowledgeFileStatus.UPLOADING, KnowledgeFileStatus.PENDING)) {
                LOGGER.info("Skip splitting stage for {} because it is not ready", fileId);
                return;
            }
            // 通知前端进度
            eventPublisher.publish(buildEvent(fileId, KnowledgeFileStatus.SPLITTING, 20, "开始拆分文档"));

            KnowledgeFileEntity file = knowledgeFileRepository.selectById(fileId);
            if (file == null) {
                LOGGER.warn("Knowledge file {} removed before splitting", fileId);
                return;
            }
            List<TextSegment> segments;
            String objectKey = storageService.extractObjectKey(file.getFilePath());
            try (InputStream inputStream = storageService.openStream(objectKey)) {
                // 文档拆分
                segments = documentProcessingService.parseAndSplit(inputStream, file.getFileType());
            }
            if (segments.isEmpty()) {
                throw new BusinessException("未在文件中解析到可用片段");
            }
            eventPublisher.publish(buildEvent(fileId, KnowledgeFileStatus.SPLITTING, 50, "拆分完成，等待向量化"));
            executorService.submit(() -> processEmbeddingStage(fileId, segments));
        } catch (Exception ex) {
            LOGGER.error("Splitting stage failed for {}", fileId, ex);
            markFailed(fileId, ex.getMessage());
        }
    }

    /**
     * Stage 2: 文档嵌入
     */
    private void processEmbeddingStage(String fileId, List<TextSegment> segments) {
        try {
            if (!transitionWithTx(fileId, KnowledgeFileStatus.EMBEDDING, KnowledgeFileStatus.SPLITTING)) {
                LOGGER.info("Skip embedding stage for {} because state is invalid", fileId);
                return;
            }
            eventPublisher.publish(buildEvent(fileId, KnowledgeFileStatus.EMBEDDING, 70, "向量化处理中"));
            List<Embedding> embeddings = embeddingExecutor.embedAll(segments);
            persistEmbeddings(fileId, segments, embeddings);
            updateChunkCount(fileId, embeddings.size());
            if (!transitionWithTx(fileId, KnowledgeFileStatus.COMPLETED, KnowledgeFileStatus.EMBEDDING)) {
                LOGGER.warn("Failed to mark knowledge file {} as COMPLETED", fileId);
                return;
            }
            eventPublisher.publish(buildEvent(fileId, KnowledgeFileStatus.COMPLETED, 100, "处理完成"));
        } catch (Exception ex) {
            LOGGER.error("Embedding stage failed for {}", fileId, ex);
            markFailed(fileId, ex.getMessage());
        }
    }

    private void persistEmbeddings(String fileId, List<TextSegment> segments, List<Embedding> embeddings) {
        if (embeddings.size() != segments.size()) {
            throw new BusinessException("嵌入数量与文本分块数量不一致");
        }

        transactionTemplate.executeWithoutResult(status -> knowledgeEmbeddingRepository.delete(
                Wrappers.<KnowledgeEmbeddingEntity>lambdaQuery()
                        .eq(KnowledgeEmbeddingEntity::getFileId, fileId)
        ));

        List<String> ids = new ArrayList<>(embeddings.size());
        List<TextSegment> enrichedSegments = new ArrayList<>(embeddings.size());
        for (int i = 0; i < segments.size(); i++) {
            ids.add(UUID.randomUUID().toString());
            TextSegment original = segments.get(i);
            Metadata metadata = original.metadata() != null ? original.metadata().copy() : new Metadata();
            metadata.put("fileId", fileId);
            metadata.put("chunkIndex", i);
            enrichedSegments.add(TextSegment.textSegment(original.text(), metadata));
        }

        // 将向量批量写入 pgvector store
        embeddingStore.addAll(ids, embeddings, enrichedSegments);

        transactionTemplate.executeWithoutResult(status -> {
            for (int i = 0; i < ids.size(); i++) {
                TextSegment segment = enrichedSegments.get(i);
                KnowledgeEmbeddingEntity update = new KnowledgeEmbeddingEntity();
                update.setFileId(fileId);
                update.setText(segment.text());
                update.setMetadata(segment.metadata() != null ? segment.metadata().toMap() : Map.of());
                knowledgeEmbeddingRepository.checkUpdate(
                        update,
                        Wrappers.<KnowledgeEmbeddingEntity>lambdaUpdate()
                                .eq(KnowledgeEmbeddingEntity::getEmbeddingId, ids.get(i))
                );
            }
        });
    }

    private void updateChunkCount(String fileId, int chunkCount) {
        transactionTemplate.executeWithoutResult(status -> {
            LambdaUpdateWrapper<KnowledgeFileEntity> wrapper = Wrappers.<KnowledgeFileEntity>lambdaUpdate()
                    .eq(KnowledgeFileEntity::getId, fileId)
                    .set(KnowledgeFileEntity::getChunkCount, chunkCount)
                    .set(KnowledgeFileEntity::getUpdatedAt, LocalDateTime.now());
            knowledgeFileRepository.update(null, wrapper);
        });
    }

    private void markFailed(String fileId, String errorMessage) {
        transitionToFailed(fileId);
        String message = (errorMessage == null || errorMessage.isBlank()) ? "处理失败" : errorMessage;
        eventPublisher.publish(buildEvent(fileId, KnowledgeFileStatus.FAILED, 0, message));
    }

    private boolean transitionWithTx(String fileId, KnowledgeFileStatus targetStatus, KnowledgeFileStatus... previewStatus) {
        return Boolean.TRUE.equals(transactionTemplate.execute(status -> {
            LambdaUpdateWrapper<KnowledgeFileEntity> wrapper = Wrappers.<KnowledgeFileEntity>lambdaUpdate()
                    .eq(KnowledgeFileEntity::getId, fileId)
                    .in(KnowledgeFileEntity::getStatus, (Object[]) previewStatus)
                    .set(KnowledgeFileEntity::getStatus, targetStatus)
                    .set(KnowledgeFileEntity::getUpdatedAt, LocalDateTime.now());
            return knowledgeFileRepository.update(null, wrapper) > 0;
        }));
    }

    private void transitionToFailed(String fileId) {
        transactionTemplate.executeWithoutResult(status -> {
            LambdaUpdateWrapper<KnowledgeFileEntity> wrapper = Wrappers.<KnowledgeFileEntity>lambdaUpdate()
                    .eq(KnowledgeFileEntity::getId, fileId)
                    .in(KnowledgeFileEntity::getStatus,
                            KnowledgeFileStatus.PENDING,
                            KnowledgeFileStatus.UPLOADING,
                            KnowledgeFileStatus.SPLITTING,
                            KnowledgeFileStatus.EMBEDDING,
                            KnowledgeFileStatus.PROCESSING)
                    .set(KnowledgeFileEntity::getStatus, KnowledgeFileStatus.FAILED)
                    .set(KnowledgeFileEntity::getUpdatedAt, LocalDateTime.now());
            knowledgeFileRepository.update(null, wrapper);
        });
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
