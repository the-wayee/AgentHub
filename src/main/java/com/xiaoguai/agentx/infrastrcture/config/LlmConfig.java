package com.xiaoguai.agentx.infrastrcture.config;


import com.xiaoguai.agentx.domain.llm.service.LlmService;
import com.xiaoguai.agentx.infrastrcture.llm.siliconflow.SiliconFlowLlmService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-23 20:36
 * @Description: Llmconfig
 */
@Configuration
public class LlmConfig {


    @Bean
    public LlmService defaultLlmService(SiliconFlowLlmService siliconFlowLlmService) {
        return siliconFlowLlmService;
    }

    /**
     * LLM服务映射
     */
    @Bean
    public Map<String, LlmService> llmServiceMap(SiliconFlowLlmService siliconFlowLlmService) {
        Map<String, LlmService> serviceMap = new HashMap<>();
        // 确保键名与defaultProvider + "LlmService"匹配
        serviceMap.put("siliconflowLlmService", siliconFlowLlmService);
        return serviceMap;
    }
}
