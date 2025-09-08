package com.xiaoguai.agentx.application.task.assembler;


import com.xiaoguai.agentx.application.task.dto.TaskDTO;
import com.xiaoguai.agentx.domain.task.model.TaskEntity;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-08 13:37
 * @Description: TaskAssembler
 */
public class TaskAssembler {

    public static TaskDTO toDTO(TaskEntity entity) {
        if (entity == null) {
            return null;
        }

        TaskDTO dto = new TaskDTO();
        dto.setId(entity.getId());
        dto.setSessionId(entity.getSessionId());
        dto.setUserId(entity.getUserId());
        dto.setParentTaskId(entity.getParentTaskId());
        dto.setTaskName(entity.getTaskName());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus().name());
        dto.setProgress(entity.getProgress());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }

    public static List<TaskDTO> toDTOList(List<TaskEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }

        return entities.stream()
                .map(TaskAssembler::toDTO)
                .collect(Collectors.toList());
    }
}
