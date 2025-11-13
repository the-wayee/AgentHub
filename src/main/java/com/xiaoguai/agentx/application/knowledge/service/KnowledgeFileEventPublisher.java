package com.xiaoguai.agentx.application.knowledge.service;


import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeFileStatusEvent;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Maintains a Reactor sink so multiple subscribers can receive file status events in real time.
 */
@Component
public class KnowledgeFileEventPublisher {

    private final Sinks.Many<KnowledgeFileStatusEvent> sink =
            Sinks.many().multicast().onBackpressureBuffer();

    public void publish(KnowledgeFileStatusEvent event) {
        if (event.getTimestamp() == null) {
            event.setTimestamp(LocalDateTime.now());
        }
        sink.tryEmitNext(event);
    }

    public Flux<KnowledgeFileStatusEvent> stream(String fileId) {
        return sink.asFlux().filter(event -> Objects.equals(fileId, event.getFileId()));
    }
}
