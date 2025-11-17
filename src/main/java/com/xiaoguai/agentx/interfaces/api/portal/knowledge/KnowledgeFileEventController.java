package com.xiaoguai.agentx.interfaces.api.portal.knowledge;


import com.xiaoguai.agentx.application.knowledge.dto.KnowledgeFileStatusEvent;
import com.xiaoguai.agentx.application.knowledge.service.KnowledgeFileEventPublisher;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

/**
 * Streams knowledge file status via WebFlux SSE.
 */
@RestController
@RequestMapping("/knowledge/files")
public class KnowledgeFileEventController {

    private final KnowledgeFileEventPublisher eventPublisher;

    public KnowledgeFileEventController(KnowledgeFileEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    /**
     * 订阅文件
     */
    @GetMapping(value = "/{fileId}/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<KnowledgeFileStatusEvent>> subscribeFileStatus(@PathVariable String fileId) {
        return eventPublisher.subscribeUntilTerminal(fileId)
                .map(event -> ServerSentEvent.<KnowledgeFileStatusEvent>builder()
                        .id(event.getTimestamp().toString())
                        .event(event.getStatus().name())
                        .data(event)
                        .build());
    }
}
