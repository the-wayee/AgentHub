create table sessions
(
    id          varchar(36) not null
        primary key,
    title       varchar(255),
    user_id     varchar(36),
    agent_id    varchar(36),
    description text,
    is_archived boolean default false,
    metadata    text,
    created_at  timestamp   not null,
    updated_at  timestamp   not null,
    deleted_at  timestamp
);

comment on table sessions is '会话表，存储用户与Agent的对话会话';

comment on column sessions.id is '会话唯一ID';

comment on column sessions.title is '会话标题';

comment on column sessions.user_id is '所属用户ID';

comment on column sessions.agent_id is '关联的Agent版本ID';

comment on column sessions.description is '会话描述';

comment on column sessions.is_archived is '会话是否被归档';

comment on column sessions.metadata is '会话元数据，可存储其他自定义信息';

comment on column sessions.created_at is '创建时间';

comment on column sessions.updated_at is '更新时间';

comment on column sessions.deleted_at is '删除时间（逻辑删除）';

alter table sessions
    owner to postgres;

create index idx_sessions_user_id
    on sessions (user_id);

create index idx_sessions_created_at
    on sessions (created_at);

create index idx_sessions_updated_at
    on sessions (updated_at);

create index idx_sessions_agent_id
    on sessions (agent_id);

create table messages
(
    id          varchar(36) not null
        primary key,
    session_id  varchar(36) not null,
    role        varchar(20) not null,
    content     text        not null,
    token_count integer default 0,
    provider    varchar(100),
    model       varchar(100),
    metadata    text,
    created_at  timestamp   not null,
    updated_at  timestamp   not null,
    deleted_at  timestamp
);

comment on table messages is '对话消息表';

comment on column messages.id is '消息唯一ID';

comment on column messages.session_id is '所属会话ID';

comment on column messages.role is '消息角色(user/assistant/system)';

comment on column messages.content is '消息内容';

comment on column messages.token_count is 'Token数量';

comment on column messages.provider is '服务提供商';

comment on column messages.model is '使用的模型';

comment on column messages.metadata is '消息元数据';

comment on column messages.created_at is '创建时间';

comment on column messages.updated_at is '更新时间';

comment on column messages.deleted_at is '删除时间（逻辑删除）';

alter table messages
    owner to postgres;

create index idx_messages_session_id
    on messages (session_id);

create index idx_messages_created_at
    on messages (created_at);

create table context
(
    id              varchar(36) not null
        primary key,
    session_id      varchar(36) not null,
    active_messages text,
    summary         text,
    created_at      timestamp   not null,
    updated_at      timestamp   not null,
    deleted_at      timestamp
);

comment on table context is '会话上下文表';

comment on column context.id is '上下文唯一ID';

comment on column context.session_id is '所属会话ID';

comment on column context.active_messages is '活跃消息ID列表';

comment on column context.summary is '历史消息摘要';

comment on column context.created_at is '创建时间';

comment on column context.updated_at is '更新时间';

comment on column context.deleted_at is '删除时间（逻辑删除）';

alter table context
    owner to postgres;

create index idx_context_session_id
    on context (session_id);

create table models
(
    id          varchar(36) not null
        primary key,
    user_id     varchar(36),
    provider_id varchar(36),
    model_id    varchar(100),
    name        varchar(255),
    description text,
    official    boolean default false,
    type        varchar(50),
    status      boolean default true,
    created_at  timestamp   not null,
    updated_at  timestamp   not null,
    deleted_at  timestamp
);

comment on table models is 'LLM模型表';

comment on column models.id is '模型唯一ID';

comment on column models.user_id is '所属用户ID';

comment on column models.provider_id is '服务提供商ID';

comment on column models.model_id is '模型标识符';

comment on column models.name is '模型名称';

comment on column models.description is '模型描述';

comment on column models.official is '是否官方模型';

comment on column models.type is '模型类型';

comment on column models.status is '模型状态(是否激活)';

comment on column models.created_at is '创建时间';

comment on column models.updated_at is '更新时间';

comment on column models.deleted_at is '删除时间（逻辑删除）';

alter table models
    owner to postgres;

create index idx_models_provider_id
    on models (provider_id);

create index idx_models_user_id
    on models (user_id);

create index idx_models_status
    on models (status);

create table providers
(
    id          varchar(36)  not null
        primary key,
    user_id     varchar(36),
    protocol    varchar(50),
    name        varchar(255) not null,
    description text,
    config      text,
    official    boolean default false,
    status      boolean default true,
    created_at  timestamp    not null,
    updated_at  timestamp    not null,
    deleted_at  timestamp
);

comment on table providers is 'LLM服务提供商表';

comment on column providers.id is '提供商唯一ID';

comment on column providers.user_id is '所属用户ID';

comment on column providers.protocol is '协议类型';

comment on column providers.name is '提供商名称';

comment on column providers.description is '提供商描述';

comment on column providers.config is '提供商配置JSON';

comment on column providers.official is '是否官方提供商';

comment on column providers.status is '状态(是否激活)';

comment on column providers.created_at is '创建时间';

comment on column providers.updated_at is '更新时间';

comment on column providers.deleted_at is '删除时间（逻辑删除）';

alter table providers
    owner to postgres;

create index idx_providers_user_id
    on providers (user_id);

create index idx_providers_status
    on providers (status);

create index idx_providers_name
    on providers (name);

create table agents
(
    id                 varchar(36)  not null
        primary key,
    name               varchar(100) not null,
    avatar             varchar(255),
    description        text,
    system_prompt      text,
    welcome_message    text,
    model_config       jsonb,
    tools              jsonb,
    knowledge_base_ids jsonb,
    published_version  varchar(36),
    enabled            boolean     default true,
    agent_type         varchar(32) default 1,
    user_id            varchar(36)  not null,
    created_at         timestamp    not null,
    updated_at         timestamp    not null,
    deleted_at         timestamp
);

comment on table agents is 'Agent表，存储AI助手的基本信息和配置';

comment on column agents.model_config is '模型配置，JSON格式，包含模型类型、温度等参数';

comment on column agents.tools is 'Agent可使用的工具列表，JSON格式';

comment on column agents.knowledge_base_ids is '关联的知识库ID列表，JSON格式';

comment on column agents.published_version is '当前发布的版本ID';

comment on column agents.enabled is 'Agent状态：false-禁用，true-启用';

comment on column agents.agent_type is 'Agent类型：1-聊天助手, 2-功能性Agent';

comment on column agents.deleted_at is '软删除标记，非空表示已删除';

alter table agents
    owner to postgres;

create index idx_agents_user_id
    on agents (user_id);

create index idx_agents_enabled
    on agents (enabled);

create index idx_agents_name
    on agents (name);

create index idx_agents_agent_type
    on agents (agent_type);

create table agent_versions
(
    id                 varchar(36)  not null
        primary key,
    agent_id           varchar(36)  not null,
    name               varchar(100) not null,
    avatar             varchar(255),
    description        text,
    version_number     varchar(20)  not null,
    system_prompt      text,
    welcome_message    text,
    model_config       jsonb,
    tools              jsonb,
    knowledge_base_ids jsonb,
    change_log         text,
    agent_type         smallint default 1,
    publish_status     smallint default 1,
    reject_reason      text,
    review_time        timestamp,
    published_at       timestamp,
    user_id            varchar(36)  not null,
    created_at         timestamp    not null,
    updated_at         timestamp    not null,
    deleted_at         timestamp
);

comment on table agent_versions is 'Agent版本表，记录Agent的各个版本';

comment on column agent_versions.version_number is '版本号，如1.0.0';

comment on column agent_versions.change_log is '版本更新日志';

comment on column agent_versions.publish_status is '发布状态：1-审核中, 2-已发布, 3-拒绝, 4-已下架';

comment on column agent_versions.reject_reason is '审核拒绝原因';

comment on column agent_versions.published_at is '发布时间';

comment on column agent_versions.deleted_at is '软删除标记';

alter table agent_versions
    owner to postgres;

create index idx_agent_versions_agent_id
    on agent_versions (agent_id);

create index idx_agent_versions_published_at
    on agent_versions (published_at);

create index idx_agent_versions_publish_status
    on agent_versions (publish_status);

create table agent_workspace
(
    id               varchar(36) not null
        primary key,
    agent_id         varchar(36) not null,
    user_id          varchar(36) not null,
    llm_model_config jsonb,
    created_at       timestamp   not null,
    updated_at       timestamp   not null,
    deleted_at       timestamp,
    unique (agent_id, user_id)
);

comment on table agent_workspace is 'Agent工作区表，记录用户添加到工作区的Agent';

comment on column agent_workspace.llm_model_config is 'LLM模型配置';

alter table agent_workspace
    owner to postgres;

create index idx_agent_workspace_user_id
    on agent_workspace (user_id);

create index idx_agent_workspace_agent_id
    on agent_workspace (agent_id);

