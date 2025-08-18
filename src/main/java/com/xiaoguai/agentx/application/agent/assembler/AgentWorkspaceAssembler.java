package com.xiaoguai.agentx.application.agent.assembler;


import com.xiaoguai.agentx.domain.llm.model.config.LlmModelConfig;
import com.xiaoguai.agentx.interfaces.dto.agent.UpdateModelConfigRequest;
import org.springframework.beans.BeanUtils;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-18 17:01
 * @Description: AgentWorkspaceAssembler
 */
public class AgentWorkspaceAssembler {

    public static LlmModelConfig toLLMModelConfig(UpdateModelConfigRequest request) {

        LlmModelConfig llmModelConfig = new LlmModelConfig();
        BeanUtils.copyProperties(request, llmModelConfig);
        return llmModelConfig;
    }
}
