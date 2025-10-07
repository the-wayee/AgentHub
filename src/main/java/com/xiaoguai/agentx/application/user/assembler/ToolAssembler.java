package com.xiaoguai.agentx.application.user.assembler;


import com.xiaoguai.agentx.application.user.dto.ToolDTO;
import com.xiaoguai.agentx.domain.tool.constants.ToolStatus;
import com.xiaoguai.agentx.domain.tool.model.ToolEntity;
import com.xiaoguai.agentx.infrastrcture.utils.JsonUtils;
import com.xiaoguai.agentx.interfaces.dto.tool.CreateToolRequest;
import com.xiaoguai.agentx.interfaces.dto.tool.UpdateToolRequest;
import org.springframework.beans.BeanUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 20:24
 * @Description: ToolAssembler
 */
public class ToolAssembler {


    public static ToolEntity toEntity(CreateToolRequest request, String userId) {
        ToolEntity entity = new ToolEntity();
        BeanUtils.copyProperties(request, entity);
        entity.setUserId(userId);
        return entity;
    }

    public static ToolEntity toolEntity(UpdateToolRequest request, String userId) {
        ToolEntity entity = new ToolEntity();
        BeanUtils.copyProperties(request, entity);
        entity.setUserId(userId);
        return entity;
    }

    public static ToolDTO toDTO(ToolEntity entity, String userName) {
        ToolDTO dto = new ToolDTO();
        BeanUtils.copyProperties(entity, dto);
        dto.setInstallCommand(JsonUtils.toJsonString(entity.getInstallCommand()));
        dto.setUserName(userName);
        return dto;
    }

    public static List<ToolDTO> toDTO(List<ToolEntity> tools, String userName) {
        if (tools == null || tools.isEmpty()) {
            return Collections.emptyList();
        }
        List<ToolDTO> dtos = new ArrayList<>();
        tools.forEach(tool -> {
            dtos.add(toDTO(tool, userName));
        });
        return dtos;
    }
}
