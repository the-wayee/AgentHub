drop table if exists public.sessions;
create table if not exists public.sessions
(
    id          varchar(36)                         not null
        primary key,
    title       varchar(255)                        not null,
    user_id     varchar(36)                         not null,
    agent_id    varchar(36),
    description text,
    is_archived boolean   default false,
    metadata    text,
    created_at  timestamp default CURRENT_TIMESTAMP not null,
    updated_at  timestamp default CURRENT_TIMESTAMP not null,
    deleted_at  timestamp
);

comment on table public.sessions is '会话实体类，代表一个独立的对话会话/主题';

comment on column public.sessions.id is '会话唯一ID';

comment on column public.sessions.title is '会话标题';

comment on column public.sessions.user_id is '所属用户ID';

comment on column public.sessions.agent_id is '关联的Agent版本ID';

comment on column public.sessions.description is '会话描述';

comment on column public.sessions.is_archived is '是否归档';

comment on column public.sessions.metadata is '会话元数据，可存储其他自定义信息';

comment on column public.sessions.created_at is '创建时间';

comment on column public.sessions.updated_at is '更新时间';

comment on column public.sessions.deleted_at is '逻辑删除时间';

alter table public.sessions
    owner to postgres;

create index if not exists idx_sessions_user_id
    on public.sessions (user_id);

create index if not exists idx_sessions_agent_id
    on public.sessions (agent_id);


drop table if exists public.messages;
create table if not exists public.messages
(
    id           varchar(36)                                   not null
        primary key,
    session_id   varchar(36)                                   not null,
    role         varchar(20)                                   not null,
    content      text                                          not null,
    message_type varchar(20) default 'TEXT'::character varying not null,
    token_count  integer     default 0,
    provider     varchar(50),
    model        varchar(50),
    metadata     text,
    created_at   timestamp   default CURRENT_TIMESTAMP         not null,
    updated_at   timestamp   default CURRENT_TIMESTAMP         not null,
    deleted_at   timestamp
);

comment on table public.messages is '消息实体类，代表对话中的一条消息';

comment on column public.messages.id is '消息唯一ID';

comment on column public.messages.session_id is '所属会话ID';

comment on column public.messages.role is '消息角色 (user, assistant, system)';

comment on column public.messages.content is '消息内容';

comment on column public.messages.message_type is '消息类型';

comment on column public.messages.token_count is 'Token数量';

comment on column public.messages.provider is '服务提供商';

comment on column public.messages.model is '使用的模型';

comment on column public.messages.metadata is '消息元数据';

comment on column public.messages.created_at is '创建时间';

comment on column public.messages.updated_at is '更新时间';

comment on column public.messages.deleted_at is '逻辑删除时间';

alter table public.messages
    owner to postgres;

create index if not exists idx_messages_session_id
    on public.messages (session_id);

drop table if exists public.context;
create table if not exists public.context
(
    id              varchar(36)                         not null
        primary key,
    session_id      varchar(36)                         not null,
    active_messages text,
    summary         text,
    created_at      timestamp default CURRENT_TIMESTAMP not null,
    updated_at      timestamp default CURRENT_TIMESTAMP not null,
    deleted_at      timestamp
);

comment on table public.context is '上下文实体类，管理会话的上下文窗口';

comment on column public.context.id is '上下文唯一ID';

comment on column public.context.session_id is '所属会话ID';

comment on column public.context.active_messages is '活跃消息ID列表，JSON数组格式';

comment on column public.context.summary is '历史消息摘要';

comment on column public.context.created_at is '创建时间';

comment on column public.context.updated_at is '更新时间';

comment on column public.context.deleted_at is '逻辑删除时间';

alter table public.context
    owner to postgres;

create index if not exists idx_context_session_id
    on public.context (session_id);

drop table if exists public.agents;
create table if not exists public.agents
(
    id                varchar(36)                         not null
        primary key,
    name              varchar(255)                        not null,
    avatar            varchar(255),
    description       text,
    system_prompt     text,
    welcome_message   text,
    published_version varchar(36),
    enabled           boolean   default true,
    agent_type        varchar(64)                         not null,
    user_id           varchar(36)                         not null,
    created_at        timestamp default CURRENT_TIMESTAMP not null,
    updated_at        timestamp default CURRENT_TIMESTAMP not null,
    deleted_at        timestamp
);

comment on table public.agents is 'Agent实体类，代表一个AI助手';

comment on column public.agents.id is 'Agent唯一ID';

comment on column public.agents.name is 'Agent名称';

comment on column public.agents.avatar is 'Agent头像URL';

comment on column public.agents.description is 'Agent描述';

comment on column public.agents.system_prompt is 'Agent系统提示词';

comment on column public.agents.welcome_message is '欢迎消息';

comment on column public.agents.published_version is '当前发布的版本ID';

comment on column public.agents.enabled is 'Agent状态：TRUE-启用，FALSE-禁用';

comment on column public.agents.agent_type is 'Agent类型';

comment on column public.agents.user_id is '创建者用户ID';

comment on column public.agents.created_at is '创建时间';

comment on column public.agents.updated_at is '更新时间';

comment on column public.agents.deleted_at is '逻辑删除时间';

alter table public.agents
    owner to postgres;

create index if not exists idx_agents_user_id
    on public.agents (user_id);

drop table if exists public.agent_versions;
create table if not exists public.agent_versions
(
    id                 varchar(36)                         not null
        primary key,
    agent_id           varchar(36)                         not null,
    name               varchar(255)                        not null,
    avatar             varchar(255),
    description        text,
    version_number     varchar(20)                         not null,
    system_prompt      text,
    welcome_message    text,
    tools              text,
    knowledge_base_ids text,
    change_log         text,
    agent_type         integer   default 1,
    publish_status     integer   default 1,
    reject_reason      text,
    review_time        timestamp,
    published_at       timestamp,
    user_id            varchar(36)                         not null,
    created_at         timestamp default CURRENT_TIMESTAMP not null,
    updated_at         timestamp default CURRENT_TIMESTAMP not null,
    deleted_at         timestamp
);

comment on table public.agent_versions is 'Agent版本实体类，代表一个Agent的发布版本';

comment on column public.agent_versions.id is '版本唯一ID';

comment on column public.agent_versions.agent_id is '关联的Agent ID';

comment on column public.agent_versions.name is 'Agent名称';

comment on column public.agent_versions.avatar is 'Agent头像URL';

comment on column public.agent_versions.description is 'Agent描述';

comment on column public.agent_versions.version_number is '版本号，如1.0.0';

comment on column public.agent_versions.system_prompt is 'Agent系统提示词';

comment on column public.agent_versions.welcome_message is '欢迎消息';

comment on column public.agent_versions.tools is 'Agent可使用的工具列表，JSON数组格式';

comment on column public.agent_versions.knowledge_base_ids is '关联的知识库ID列表，JSON数组格式';

comment on column public.agent_versions.change_log is '版本更新日志';

comment on column public.agent_versions.agent_type is 'Agent类型：1-聊天助手, 2-功能性Agent';

comment on column public.agent_versions.publish_status is '发布状态：1-审核中, 2-已发布, 3-拒绝, 4-已下架';

comment on column public.agent_versions.reject_reason is '审核拒绝原因';

comment on column public.agent_versions.review_time is '审核时间';

comment on column public.agent_versions.published_at is '发布时间';

comment on column public.agent_versions.user_id is '创建者用户ID';

comment on column public.agent_versions.created_at is '创建时间';

comment on column public.agent_versions.updated_at is '更新时间';

comment on column public.agent_versions.deleted_at is '逻辑删除时间';

alter table public.agent_versions
    owner to postgres;

create index if not exists idx_agent_versions_agent_id
    on public.agent_versions (agent_id);

create index if not exists idx_agent_versions_user_id
    on public.agent_versions (user_id);

drop table if exists public.agent_workspace;
create table if not exists public.agent_workspace
(
    id               varchar(36)                         not null
        primary key,
    agent_id         varchar(36)                         not null,
    user_id          varchar(36)                         not null,
    llm_model_config jsonb,
    created_at       timestamp default CURRENT_TIMESTAMP not null,
    updated_at       timestamp default CURRENT_TIMESTAMP not null,
    deleted_at       timestamp
);

comment on table public.agent_workspace is 'Agent工作区实体类，用于记录用户添加到工作区的Agent';

comment on column public.agent_workspace.id is '主键ID';

comment on column public.agent_workspace.agent_id is 'Agent ID';

comment on column public.agent_workspace.user_id is '用户ID';

comment on column public.agent_workspace.llm_model_config is '模型配置，JSON格式';

comment on column public.agent_workspace.created_at is '创建时间';

comment on column public.agent_workspace.updated_at is '更新时间';

comment on column public.agent_workspace.deleted_at is '逻辑删除时间';

alter table public.agent_workspace
    owner to postgres;

create index if not exists idx_agent_workspace_agent_id
    on public.agent_workspace (agent_id);

create index if not exists idx_agent_workspace_user_id
    on public.agent_workspace (user_id);

drop table if exists public.providers;
create table if not exists public.providers
(
    id          varchar(36)                         not null
        primary key,
    user_id     varchar(36),
    protocol    varchar(50)                         not null,
    name        varchar(100)                        not null,
    description text,
    config      text,
    official    boolean   default false,
    status      boolean   default true,
    created_at  timestamp default CURRENT_TIMESTAMP not null,
    updated_at  timestamp default CURRENT_TIMESTAMP not null,
    deleted_at  timestamp
);

comment on table public.providers is '服务提供商领域模型';

comment on column public.providers.id is '服务提供商ID';

comment on column public.providers.user_id is '用户ID';

comment on column public.providers.protocol is '协议类型';

comment on column public.providers.name is '服务提供商名称';

comment on column public.providers.description is '服务提供商描述';

comment on column public.providers.config is '服务提供商配置，JSON格式';

comment on column public.providers.official is '是否官方服务提供商';

comment on column public.providers.status is '服务提供商状态';

comment on column public.providers.created_at is '创建时间';

comment on column public.providers.updated_at is '更新时间';

comment on column public.providers.deleted_at is '逻辑删除时间';

alter table public.providers
    owner to postgres;

create index if not exists idx_providers_user_id
    on public.providers (user_id);

drop table if exists public.models;
create table if not exists public.models
(
    id          varchar(36)                         not null
        primary key,
    user_id     varchar(36),
    provider_id varchar(36)                         not null,
    model_id    varchar(100)                        not null,
    name        varchar(100)                        not null,
    description text,
    official    boolean   default false,
    type        varchar(20)                         not null,
    status      boolean   default true,
    created_at  timestamp default CURRENT_TIMESTAMP not null,
    updated_at  timestamp default CURRENT_TIMESTAMP not null,
    deleted_at  timestamp
);

comment on table public.models is '模型领域模型';

comment on column public.models.id is '模型ID';

comment on column public.models.user_id is '用户ID';

comment on column public.models.provider_id is '服务提供商ID';

comment on column public.models.model_id is '模型ID标识';

comment on column public.models.name is '模型名称';

comment on column public.models.description is '模型描述';

comment on column public.models.official is '是否官方模型';

comment on column public.models.type is '模型类型';

comment on column public.models.status is '模型状态';

comment on column public.models.created_at is '创建时间';

comment on column public.models.updated_at is '更新时间';

comment on column public.models.deleted_at is '逻辑删除时间';

alter table public.models
    owner to postgres;

create index if not exists idx_models_provider_id
    on public.models (provider_id);

create index if not exists idx_models_user_id
    on public.models (user_id);

drop table if exists public.agent_tasks;
create table if not exists public.agent_tasks
(
    id             varchar(36)                         not null
        primary key,
    session_id     varchar(36)                         not null,
    user_id        varchar(36)                         not null,
    parent_task_id varchar(36),
    task_name      varchar(255)                        not null,
    description    text,
    status         varchar(20),
    progress       integer   default 0,
    start_time     timestamp,
    end_time       timestamp,
    task_result    text,
    created_at     timestamp default CURRENT_TIMESTAMP not null,
    updated_at     timestamp default CURRENT_TIMESTAMP not null,
    deleted_at     timestamp
);

comment on table public.agent_tasks is '任务实体类';

comment on column public.agent_tasks.id is '任务ID';

comment on column public.agent_tasks.session_id is '所属会话ID';

comment on column public.agent_tasks.user_id is '用户ID';

comment on column public.agent_tasks.parent_task_id is '父任务ID';

comment on column public.agent_tasks.task_name is '任务名称';

comment on column public.agent_tasks.description is '任务描述';

comment on column public.agent_tasks.status is '任务状态';

comment on column public.agent_tasks.progress is '任务进度,存放父任务中';

comment on column public.agent_tasks.start_time is '开始时间';

comment on column public.agent_tasks.end_time is '结束时间';

comment on column public.agent_tasks.task_result is '任务结果';

comment on column public.agent_tasks.created_at is '创建时间';

comment on column public.agent_tasks.updated_at is '更新时间';

comment on column public.agent_tasks.deleted_at is '逻辑删除时间';

alter table public.agent_tasks
    owner to postgres;

create index if not exists idx_agent_tasks_session_id
    on public.agent_tasks (session_id);

create index if not exists idx_agent_tasks_user_id
    on public.agent_tasks (user_id);

create index if not exists idx_agent_tasks_parent_task_id
    on public.agent_tasks (parent_task_id);


CREATE TABLE users (
                       id varchar(36) PRIMARY KEY,
                       nickname varchar(255) NOT NULL,
                       email varchar(255),
                       phone varchar(11),
                       password varchar NOT NULL,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       deleted_at TIMESTAMP,
                       github_id varchar(255),
                       github_login varchar(255),
                       avatar_url varchar(255)
);

COMMENT ON COLUMN users.id IS '主键';
COMMENT ON COLUMN users.nickname IS '昵称';
COMMENT ON COLUMN users.email IS '邮箱';
COMMENT ON COLUMN users.phone IS '手机号';
COMMENT ON COLUMN users.password IS '密码';
COMMENT ON COLUMN users.created_at IS '创建时间';
COMMENT ON COLUMN users.updated_at IS '更新时间';
COMMENT ON COLUMN users.deleted_at IS '逻辑删除时间';



INSERT INTO public.agent_workspace (id, agent_id, user_id, llm_model_config, created_at, updated_at, deleted_at) VALUES ('ead8686aef44524dd9d3b89fdfbdb24a', 'c3e412cb5da36b9709ccbcb120207f1d', '1', '{"modelId": "e3580d308d375eac56ca0a96b922fe5d", "maxTokens": 1000, "reserveRatio": 60.0, "strategyType": "NONE", "summaryThreshold": 2}', '2025-09-08 17:39:14.955310', '2025-09-08 17:41:25.637744', null);
INSERT INTO public.agents (id, name, avatar, description, system_prompt, welcome_message, published_version, enabled, agent_type, user_id, created_at, updated_at, deleted_at) VALUES ('c3e412cb5da36b9709ccbcb120207f1d', '小乖', '', '小乖', '你是一个有帮助的助手', '你好，请问我能帮到你什么', null, true, 'FUNCTIONAL_AGENT', '1', '2025-09-08 17:39:14.952646', '2025-09-08 17:39:14.952646', null);
INSERT INTO public.models (id, user_id, provider_id, model_id, name, description, official, type, status, created_at, updated_at, deleted_at) VALUES ('e3580d308d375eac56ca0a96b922fe5d', '1', 'eab86898ebda4226a2dc1558af8d37b9', 'qwen-plus', 'qwen-plus', '阿里云热门模型', false, 'NORMAL', true, '2025-09-08 17:40:26.884930', '2025-09-08 17:40:26.884930', null);
INSERT INTO public.providers (id, user_id, protocol, name, description, config, official, status, created_at, updated_at, deleted_at) VALUES ('eab86898ebda4226a2dc1558af8d37b9', '1', 'DASHSCOPE', '阿里云百炼', '阿里云一站式大模型服务平台，支持快速搭建内容创作、数据分析、智能问答等AI专业应用', 'MyJVTjmz9uhTX6xcSsvq5Ox1Kxjtsr7xYgHS5GbGnMZKYLBudQQTumaK7DLgQiKSNihDpQHULbjm51gVZRsEyKen350abGZwLot8siOZmr3flBbrUVl1mihNyU3NAdGRcM5btNrPnK9jcTy4IQKdqCbM6WO5bsn9nJiNRpdb0Ejn5Eel3Gxa4uXLlLAoqFIf', false, true, '2025-09-08 17:40:10.800460', '2025-09-08 17:40:10.800460', null);
INSERT INTO public.sessions (id, title, user_id, agent_id, description, is_archived, metadata, created_at, updated_at, deleted_at) VALUES ('f48c9f0cbd873dbdee155ee86b2d5229', '新会话', '1', 'c3e412cb5da36b9709ccbcb120207f1d', null, false, null, '2025-09-08 17:42:07.990875', '2025-09-08 17:42:07.990875', null);
