package com.xiaoguai.agentx.infrastrcture.config;


import com.alibaba.ttl.threadpool.TtlExecutors;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-25 13:44
 * @Description: 线程池配置 - 异步上下文
 */
@Configuration
public class ThreadPoolConfig {

    @Bean
    public ExecutorService contextExecutorService() {
        ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
        // 核心线程数：最重要的参数，即使没有任务需要执行也会一直存活。
        // 当线程数小于核心线程数时，即使有线程空闲，也会优先创建线程
        taskExecutor.setCorePoolSize(20);
        // 是否允许核心线程会超时关闭
        taskExecutor.setAllowCoreThreadTimeOut(true);
        // 最大线程数：用满时，线程池会拒绝处理任务而抛出异常。
        taskExecutor.setMaxPoolSize(5000);
        // 任务队列容量（阻塞队列）：当核心线程数达到最大时，新任务会放在队列中排队等待执行
        taskExecutor.setQueueCapacity(5000);
        // 线程空闲时间：当线程空闲时间达到keepAliveTime时，线程会退出，直到线程数量=corePoolSize。
        // 如果allowCoreThreadTimeout=true，则会直到线程数量=0。
        taskExecutor.setKeepAliveSeconds(60);
        taskExecutor.setThreadNamePrefix("customExecutor-");
        // 当线程数已经达到maxPoolSize，且队列已满，会拒绝新任务。
        // 线程池对拒绝任务（无线程可用）的处理策略，目前只支持AbortPolicy、CallerRunsPolicy；默认为前者
        //CALLER_RUNS：不在新线程中执行任务，而是由调用者所在的线程来执行
        taskExecutor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        // 调度器shutdown被调用时等待当前被调度的任务完成
        taskExecutor.setWaitForTasksToCompleteOnShutdown(true);
        // 等待时长
        taskExecutor.setAwaitTerminationSeconds(60);
        taskExecutor.initialize();
        return TtlExecutors.getTtlExecutorService(taskExecutor.getThreadPoolExecutor());
    }
}
