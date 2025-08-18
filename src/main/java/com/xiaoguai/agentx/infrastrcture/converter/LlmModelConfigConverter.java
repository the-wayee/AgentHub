package com.xiaoguai.agentx.infrastrcture.converter;

import com.xiaoguai.agentx.domain.llm.model.config.LlmModelConfig;
import org.apache.ibatis.type.MappedTypes;

/**
 * 模型配置转换器
 */
@MappedTypes(LlmModelConfig.class)
public class LlmModelConfigConverter extends JsonToStringConverter<LlmModelConfig> {
    
    public LlmModelConfigConverter() {
        super(LlmModelConfig.class);
    }
} 