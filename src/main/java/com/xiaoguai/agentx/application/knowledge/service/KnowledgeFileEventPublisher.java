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

    // 订阅事件
    public Flux<KnowledgeFileStatusEvent> subscribe(String fileId) {
        return getSink(fileId).asFlux().filter(event -> Objects.equals(fileId, event.getFileId()));
    }


    private Sinks.Many<KnowledgeFileStatusEvent> getSink(String fileId) {
        return sinkMap.computeIfAbsent(fileId,
                id -> Sinks.many().replay().latest());
    }
}
