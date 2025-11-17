package com.xiaoguai.agentx.infrastrcture.config;


import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * PgVector embedding store configuration.
 */
@ConfigurationProperties(prefix = "knowledge.vector-store")
public class KnowledgeVectorStoreProperties {

    private String host = "localhost";
    private Integer port = 5432;
    private String database = "agenthub";
    private String user = "postgres";
    private String password = "postgres";
    private String table = "document_embeddings";
    private Integer dimension = 1024;
    private Boolean createTable = true;
    private Boolean useIndex = true;
    private Integer indexListSize = 100;

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getTable() {
        return table;
    }

    public void setTable(String table) {
        this.table = table;
    }

    public Integer getDimension() {
        return dimension;
    }

    public void setDimension(Integer dimension) {
        this.dimension = dimension;
    }

    public Boolean getCreateTable() {
        return createTable;
    }

    public void setCreateTable(Boolean createTable) {
        this.createTable = createTable;
    }

    public Boolean getUseIndex() {
        return useIndex;
    }

    public void setUseIndex(Boolean useIndex) {
        this.useIndex = useIndex;
    }

    public Integer getIndexListSize() {
        return indexListSize;
    }

    public void setIndexListSize(Integer indexListSize) {
        this.indexListSize = indexListSize;
    }
}
