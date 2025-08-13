create table if not exists public.sessions
(
    id          varchar(36)  not null
        primary key,
    title       varchar(100) not null,
    user_id     varchar(36)  not null,
    agent_id    varchar(36)  not null,
    description text,
    is_archived boolean default false,
    metadata    jsonb,
    created_at  timestamp    not null,
    updated_at  timestamp    not null,
    deleted_at  timestamp
);

comment on table public.sessions is '会话表，存储用户与Agent的对话会话';

comment on column public.sessions.agent_id is '关联的Agent ID，指定该会话使用的Agent';

comment on column public.sessions.is_archived is '会话是否被归档';

comment on column public.sessions.metadata is '会话的元数据，JSON格式';

alter table public.sessions
    owner to postgres;

create index if not exists idx_sessions_user_id
    on public.sessions (user_id);

create index if not exists idx_sessions_created_at
    on public.sessions (created_at);

create index if not exists idx_sessions_updated_at
    on public.sessions (updated_at);

create index if not exists idx_sessions_agent_id
    on public.sessions (agent_id);

create table if not exists public.messages
(
    id          varchar(36) not null
        primary key,
    session_id  varchar(36) not null,
    role        varchar(20) not null,
    content     text        not null,
    token_count integer default 0,
    provider    varchar(50),
    model       varchar(50),
    metadata    text,
    created_at  timestamp   not null,
    updated_at  timestamp   not null,
    deleted_at  timestamp
);

comment on table public.messages is '消息表，存储会话中的所有消息';

comment on column public.messages.role is '消息角色：user、assistant或system';

comment on column public.messages.token_count is '消息的token数量';

comment on column public.messages.provider is 'LLM提供商，如OpenAI、Anthropic等';

comment on column public.messages.metadata is '消息的元数据';

alter table public.messages
    owner to postgres;

create index if not exists idx_messages_session_id
    on public.messages (session_id);

create index if not exists idx_messages_created_at
    on public.messages (created_at);

create table if not exists public.context
(
    id              varchar(36) not null
        primary key,
    session_id      varchar(36) not null,
    active_messages jsonb,
    summary         text,
    created_at      timestamp   not null,
    updated_at      timestamp   not null,
    deleted_at      timestamp
);

comment on table public.context is '上下文表，管理对话上下文';

comment on column public.context.active_messages is '当前活跃的消息ID列表，JSON格式';

comment on column public.context.summary is '历史消息的摘要';

alter table public.context
    owner to postgres;

create index if not exists idx_context_session_id
    on public.context (session_id);

create table if not exists public.agents
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
    enabled            boolean  default true,
    agent_type         smallint default 1,
    user_id            varchar(36)  not null,
    created_at         timestamp    not null,
    updated_at         timestamp    not null,
    deleted_at         timestamp
);

comment on table public.agents is 'Agent表，存储AI助手的基本信息和配置';

comment on column public.agents.model_config is '模型配置，JSON格式，包含模型类型、温度等参数';

comment on column public.agents.tools is 'Agent可使用的工具列表，JSON格式';

comment on column public.agents.knowledge_base_ids is '关联的知识库ID列表，JSON格式';

comment on column public.agents.published_version is '当前发布的版本ID';

comment on column public.agents.enabled is 'Agent状态：false-禁用，true-启用';

comment on column public.agents.agent_type is 'Agent类型：1-聊天助手, 2-功能性Agent';

comment on column public.agents.deleted_at is '软删除标记，非空表示已删除';

alter table public.agents
    owner to postgres;

create index if not exists idx_agents_user_id
    on public.agents (user_id);

create index if not exists idx_agents_enabled
    on public.agents (enabled);

create index if not exists idx_agents_agent_type
    on public.agents (agent_type);

create index if not exists idx_agents_name
    on public.agents (name);

create table if not exists public.agent_versions
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

comment on table public.agent_versions is 'Agent版本表，记录Agent的各个版本';

comment on column public.agent_versions.version_number is '版本号，如1.0.0';

comment on column public.agent_versions.change_log is '版本更新日志';

comment on column public.agent_versions.publish_status is '发布状态：1-审核中, 2-已发布, 3-拒绝, 4-已下架';

comment on column public.agent_versions.reject_reason is '审核拒绝原因';

comment on column public.agent_versions.published_at is '发布时间';

comment on column public.agent_versions.deleted_at is '软删除标记';

alter table public.agent_versions
    owner to postgres;

create index if not exists idx_agent_versions_agent_id
    on public.agent_versions (agent_id);

create index if not exists idx_agent_versions_published_at
    on public.agent_versions (published_at);

create index if not exists idx_agent_versions_publish_status
    on public.agent_versions (publish_status);

create table if not exists public.agent_workspace
(
    id         varchar(36) not null
        primary key,
    agent_id   varchar(36) not null,
    user_id    varchar(36) not null,
    model_id   varchar(36),
    created_at timestamp   not null,
    updated_at timestamp   not null,
    deleted_at timestamp,
    unique (agent_id, user_id)
);

comment on table public.agent_workspace is 'Agent工作区表，记录用户添加到工作区的Agent';

comment on column public.agent_workspace.model_id is '关联的模型ID';

alter table public.agent_workspace
    owner to postgres;

create index if not exists idx_agent_workspace_user_id
    on public.agent_workspace (user_id);

create index if not exists idx_agent_workspace_agent_id
    on public.agent_workspace (agent_id);

create table if not exists public.providers
(
    id          varchar(36)  not null
        primary key,
    user_id     varchar(36),
    protocol    varchar(20),
    name        varchar(100) not null,
    description text,
    config      text,
    official    boolean default false,
    status      boolean default true,
    created_at  timestamp    not null,
    updated_at  timestamp    not null,
    deleted_at  timestamp
);

comment on table public.providers is '服务提供商表，记录LLM服务提供商信息';

comment on column public.providers.protocol is '协议类型';

comment on column public.providers.config is '提供商配置，包含API密钥等信息';

comment on column public.providers.official is '是否为官方提供商';

comment on column public.providers.status is '提供商状态：false-禁用，true-启用';

alter table public.providers
    owner to postgres;

create index if not exists idx_providers_user_id
    on public.providers (user_id);

create table if not exists public.models
(
    id          varchar(36)  not null
        primary key,
    user_id     varchar(36),
    provider_id varchar(36)  not null,
    model_id    varchar(50)  not null,
    name        varchar(100) not null,
    description text,
    official    boolean default false,
    type        varchar(20),
    config      jsonb,
    status      boolean default true,
    created_at  timestamp    not null,
    updated_at  timestamp    not null,
    deleted_at  timestamp
);

comment on table public.models is '模型表，记录可用的LLM模型信息';

comment on column public.models.provider_id is '关联的服务提供商ID';

comment on column public.models.model_id is '模型原始ID，如gpt-4等';

comment on column public.models.official is '是否为官方模型';

comment on column public.models.type is '模型类型';

comment on column public.models.config is '模型配置，JSON格式';

comment on column public.models.status is '模型状态：false-禁用，true-启用';

alter table public.models
    owner to postgres;

create index if not exists idx_models_provider_id
    on public.models (provider_id);

create index if not exists idx_models_user_id
    on public.models (user_id);

