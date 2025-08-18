package com.xiaoguai.agentx.domain.conversation.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.xiaoguai.agentx.domain.conversation.constants.Role;
import com.xiaoguai.agentx.infrastrcture.entity.BaseEntity;

/**
 * 消息实体类，代表对话中的一条消息
 */
@TableName("messages")
public class MessageEntity extends BaseEntity {

    /**
     * 消息唯一ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_UUID)
    private String id;

    /**
     * 所属会话ID
     */
    @TableField("session_id")
    private String sessionId;

    /**
     * 消息角色 (user, assistant, system)
     */
    @TableField("role")
    private Role role;

    /**
     * 消息内容
     */
    @TableField("content")
    private String content;

    /**
     * Token数量
     */
    @TableField("token_count")
    private Integer tokenCount;

    /**
     * 服务提供商
     */
    @TableField("provider")
    private String provider;

    /**
     * 使用的模型
     */
    @TableField("model")
    private String model;

    /**
     * 消息元数据
     */
    @TableField("metadata")
    private String metadata;

    /**
     * 无参构造函数
     */
    public MessageEntity() {
    }

    // Getter和Setter方法
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getTokenCount() {
        return tokenCount;
    }

    public void setTokenCount(Integer tokenCount) {
        this.tokenCount = tokenCount;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

}