package com.xiaoguai.agentx.application.knowledge.service;


import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeFileStatusEvent;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Maintains a Reactor sink so multiple subscribers can receive file status events in real time.
 */
@Component
public class KnowledgeFileEventPublisher {

    private final Map<String, Sinks.Many<KnowledgeFileStatusEvent>> sinkMap = new ConcurrentHashMap<>();

    // 推送事件
    public void publish(KnowledgeFileStatusEvent event) {
        if (event.getTimestamp() == null) {
            event.setTimestamp(LocalDateTime.now());
        }
        getSink(event.getFileId()).tryEmitNext(event);
    }

    // 订阅事件，调用方可自行 takeUntil
    public Flux<KnowledgeFileStatusEvent> subscribe(String fileId) {
        return getSink(fileId)
                .asFlux()
                .filter(event -> Objects.equals(fileId, event.getFileId()));
    }

    // 自动在文件进入终态(COMPLETED/FAILED)后结束的 Flux
    public Flux<KnowledgeFileStatusEvent> subscribeUntilTerminal(String fileId) {
        return subscribe(fileId).takeUntil(this::isTerminal);
    }

    private boolean isTerminal(KnowledgeFileStatusEvent event) {
        return event.getStatus() != null && switch (event.getStatus()) {
            case COMPLETED, FAILED -> true;
            default -> false;
        };
    }

    private Sinks.Many<KnowledgeFileStatusEvent> getSink(String fileId) {
        return sinkMap.computeIfAbsent(fileId,
                id -> Sinks.many().replay().latest());
    }
}
