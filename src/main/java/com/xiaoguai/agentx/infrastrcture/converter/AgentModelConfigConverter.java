package com.xiaoguai.agentx.infrastrcture.converter;


import com.xiaoguai.agentx.domain.agent.model.AgentModelConfig;
import org.apache.ibatis.type.MappedTypes;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 20:29
 * @Description: 模型配置转换器
 */
@MappedTypes(AgentModelConfig.class)
public class AgentModelConfigConverter extends JsonToStringConverter<AgentModelConfig>{

    public AgentModelConfigConverter() {
        super(AgentModelConfig.class);
    }
}
