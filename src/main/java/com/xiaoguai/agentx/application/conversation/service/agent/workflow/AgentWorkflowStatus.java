package com.xiaoguai.agentx.application.conversation.service.agent.workflow;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-14 15:20
 * @Description: 工作流状态
 */
public enum AgentWorkflowStatus {

    /**
     * 初始化
     */
    INITIALIZED,

    /**
     * 分析用户信息
     */
    ANALYZE,

    /**
     * 任务拆分中
     */
    TASK_SPLIT,

    /**
     * 任务拆分完成
     */
    TASK_SPLIT_COMPLETE,

    /**
     * 任务执行中
     */
    TASK_EXECUTE,

    /**
     * 任务执行完成
     */
    TASK_EXECUTE_COMPLETE,

    /**
     * 结果汇总
     */
    SUMMERIZE,

    /**
     * 完成
     */
    COMPLETED,

    /**
     * 失败
     */
    FAILED;
}
