package com.xiaoguai.agentx.infrastrcture.converter;

import com.xiaoguai.agentx.domain.llm.model.config.LLMModelConfig;
import org.apache.ibatis.type.MappedTypes;

/**
 * 模型配置转换器
 */
@MappedTypes(LLMModelConfig.class)
public class ModelConfigConverter extends JsonToStringConverter<LLMModelConfig> {
    
    public ModelConfigConverter() {
        super(LLMModelConfig.class);
    }
} 