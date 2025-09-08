package com.xiaoguai.agentx.domain.task.constants;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-08 11:34
 * @Description: 任务状态
 */
public enum TaskStatus {

    /**
     * 等待中
     */
    WAITING,

    /**
     * 进行中
     */
    PROGRESSING,

    /**
     * 已完成
     */
    COMPLETED,

    /**
     * 失败
     */
    FAILED;
}
