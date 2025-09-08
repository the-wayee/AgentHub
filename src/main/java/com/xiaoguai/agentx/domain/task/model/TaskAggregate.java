package com.xiaoguai.agentx.domain.task.model;


import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-08 11:39
 * @Description: 任务聚合根，父子任务
 */
public class TaskAggregate {

    /**
     * 父任务
     */
    private TaskEntity task;

    /**
     * 子任务
     */
    private List<TaskEntity> subTasks;

    public TaskAggregate(TaskEntity task, List<TaskEntity> subTasks) {
        this.task = task;
        this.subTasks = subTasks;
    }

    public TaskEntity getTask() {
        return task;
    }



    public List<TaskEntity> getSubTasks() {
        return subTasks;
    }


}
