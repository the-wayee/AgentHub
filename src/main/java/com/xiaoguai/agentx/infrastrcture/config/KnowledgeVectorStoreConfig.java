package com.xiaoguai.agentx.infrastrcture.config;


import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Provides a PgVector-based EmbeddingStore bean for knowledge ingestion.
 */
@Configuration
@EnableConfigurationProperties(KnowledgeVectorStoreProperties.class)
public class KnowledgeVectorStoreConfig {

    @Bean
    public EmbeddingStore<TextSegment> knowledgeEmbeddingStore(KnowledgeVectorStoreProperties props) {
        return PgVectorEmbeddingStore.builder()
                .host(props.getHost())
                .port(props.getPort())
                .user(props.getUser())
                .password(props.getPassword())
                .database(props.getDatabase())
                .table(props.getTable())
                .dimension(props.getDimension())
                .createTable(props.getCreateTable())
                .useIndex(props.getUseIndex())
                .indexListSize(props.getIndexListSize())
                .build();
    }
}
