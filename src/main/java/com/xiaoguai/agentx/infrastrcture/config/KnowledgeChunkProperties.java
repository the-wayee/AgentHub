package com.xiaoguai.agentx.infrastrcture.config;


import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Chunk configuration used by LangChain4J splitters.
 */
@Configuration
@ConfigurationProperties(prefix = "knowledge.chunk")
public class KnowledgeChunkProperties {

    /**
     * Max characters in a single chunk.
     */
    private int size = 1200;

    /**
     * Overlap between adjacent chunks.
     */
    private int overlap = 200;

    /**
     * Optional token ceiling when estimators are available.
     */
    private int maxTokens = 800;

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public int getOverlap() {
        return overlap;
    }

    public void setOverlap(int overlap) {
        this.overlap = overlap;
    }

    public int getMaxTokens() {
        return maxTokens;
    }

    public void setMaxTokens(int maxTokens) {
        this.maxTokens = maxTokens;
    }
}
