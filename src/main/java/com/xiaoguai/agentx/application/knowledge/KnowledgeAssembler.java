package com.xiaoguai.agentx.application.knowledge;

import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeBaseDTO;
import com.xiaoguai.agentx.domain.knowledge.model.KnowledgeBaseEntity;
import org.springframework.beans.BeanUtils;

public class KnowledgeAssembler {

    public static KnowledgeBaseDTO toDTO(KnowledgeBaseEntity e) {
        KnowledgeBaseDTO dto = new KnowledgeBaseDTO();
        BeanUtils.copyProperties(e, dto);
        return dto;
    }
}
