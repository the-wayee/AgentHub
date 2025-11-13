package com.xiaoguai.agentx.application.knowledge.assembler;


import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeFileDTO;
import com.xiaoguai.agentx.domain.knowledge.model.KnowledgeFileEntity;

/**
 * Converts KnowledgeFileEntity into DTO objects for controllers.
 */
public class KnowledgeFileAssembler {

    private KnowledgeFileAssembler() {
    }

    public static KnowledgeFileDTO toDTO(KnowledgeFileEntity entity) {
        KnowledgeFileDTO dto = new KnowledgeFileDTO();
        dto.setId(entity.getId());
        dto.setKnowledgeBaseId(entity.getKnowledgeBaseId());
        dto.setFileName(entity.getFileName());
        dto.setFilePath(entity.getFilePath());
        dto.setFileType(entity.getFileType());
        dto.setFileSize(entity.getFileSize());
        dto.setStatus(entity.getStatus());
        dto.setChunkCount(entity.getChunkCount());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
