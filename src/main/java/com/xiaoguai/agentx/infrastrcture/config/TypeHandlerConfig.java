package com.xiaoguai.agentx.infrastrcture.config;


import com.xiaoguai.agentx.domain.agent.constant.AgentType;
import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import com.xiaoguai.agentx.domain.conversation.constants.Role;
import com.xiaoguai.agentx.domain.llm.model.config.LlmModelConfig;
import com.xiaoguai.agentx.domain.llm.model.config.ProviderConfig;
import com.xiaoguai.agentx.domain.llm.model.enums.ModelType;
import com.xiaoguai.agentx.domain.task.constants.TaskStatus;
import com.xiaoguai.agentx.infrastrcture.converter.*;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.type.TypeHandlerRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 16:15
 * @Description: 类型处理器配置
 */
@Configuration
public class TypeHandlerConfig {

    private static final Logger logger = LoggerFactory.getLogger(TypeHandlerConfig.class);

    @Resource
    private SqlSessionFactory sqlSessionFactory;

    /**
     * 初始化注册类型处理器
     */
    @PostConstruct
    public void registerTypeHandlers() {
        TypeHandlerRegistry typeHandlerRegistry = sqlSessionFactory.getConfiguration().getTypeHandlerRegistry();

        // 确保自动扫描没有生效时，我们手动注册需要的转换器
        typeHandlerRegistry.register(ProviderConfig.class, new ProviderConfigConverter());
        typeHandlerRegistry.register(AgentType.class, new AgentTypeConverter());
        typeHandlerRegistry.register(List.class, new ListConverter());
        typeHandlerRegistry.register(LlmModelConfig.class, new LlmModelConfigConverter());
        typeHandlerRegistry.register(ModelType.class, new ModelTypeConverter());
        typeHandlerRegistry.register(ProviderProtocol.class, new ProviderProtocolConverter());
        typeHandlerRegistry.register(Role.class, new RoleConverter());
        typeHandlerRegistry.register(MessageType.class, new MessageTypeConverter());
        typeHandlerRegistry.register(TaskStatus.class, new TaskStatusConverter());

        logger.info("手动注册类型处理器：ProviderConfigConverter");

        // 打印所有已注册的类型处理器
        logger.info("已注册的类型处理器: {}", typeHandlerRegistry.getTypeHandlers().size());
    }
}
