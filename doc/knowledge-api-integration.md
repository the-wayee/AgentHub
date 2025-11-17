## AgentHub 知识库前后端对接说明

### 1. 流程概览

1. **知识库管理**
   - `POST /knowledge` 创建；`GET /knowledge` 拉取我创建的知识库；`GET /knowledge/public` 查公开库。
2. **文件处理链路**
   - `POST /knowledge/files/upload` 上传文件（multipart，字段：`knowledgeBaseId` + `file`，大小限制 20 MB），后端自动写入 `knowledge_file` 并触发处理。
   - `GET /knowledge/{kbId}/files` 获取知识库文件列表。
   - `GET /knowledge/files/{fileId}/events` 通过 SSE 订阅状态（状态机：`PENDING/UPLOADING → SPLITTING → EMBEDDING → COMPLETED/FAILED`，事件包含 `progress` 和提示信息）。
   - chunk/向量成功写入后即可预览、发布。
3. **发布审核**
   - `POST /knowledge/publish` 提交审核（返回 `KnowledgePublishRecordDTO`），知识库状态置为 `SUBMITTED`。
   - `POST /admin/knowledge/publish/review`（后台）审核通过/拒绝。通过后知识库 `status=APPROVED`，并记录 `publishRecordId/publishedAt`。

### 2. 接口明细

| 场景 | Method & Path | 请求参数 | 响应 |
| --- | --- | --- | --- |
| 创建知识库 | `POST /knowledge` | `{ name, description }` | `KnowledgeBaseDTO` |
| 我的知识库 | `GET /knowledge` | - | `KnowledgeBaseDTO[]`，按更新时间倒序 |
| 公共知识库 | `GET /knowledge/public` | - | `KnowledgeBaseDTO[]`，仅 `PUBLIC+APPROVED` |
| 上传文件 | `POST /knowledge/files/upload` | `knowledgeBaseId` + `file` (multipart/form-data) | `KnowledgeFileDTO`（初始 `status=UPLOADING`） |
| 手动创建文件（已有 OSS 地址） | `POST /knowledge/files` | `{ knowledgeBaseId, fileName, filePath, fileType, fileSize }` | `KnowledgeFileDTO`（`status=PENDING`） |
| 查询文件列表 | `GET /knowledge/{kbId}/files` | Path: `kbId` | `KnowledgeFileDTO[]`，按创建时间倒序 |
| 文件状态 SSE | `GET /knowledge/files/{fileId}/events` | Path: `fileId` | `ServerSentEvent<KnowledgeFileStatusEvent>`，字段：`fileId/status/progress/message/timestamp` |
| 提交发布 | `POST /knowledge/publish` | `{ knowledgeBaseId, versionNumber?, changeLog? }` | `KnowledgePublishRecordDTO` |
| 审核发布（后台） | `POST /admin/knowledge/publish/review` | `{ recordId, approve, rejectReason? }` | `Result<Void>` |

### 3. 前端对接建议

1. **状态管理**
   - 页面加载时调用 `GET /knowledge` 初始化左侧列表，并存储 `selectedKbId`。
   - 切换知识库时调用 `GET /knowledge/{kbId}/files` 刷新列表；公共市场页调用 `GET /knowledge/public`。
2. **上传 & 进度**
   - `UploadDropzone` 直接请求 `POST /knowledge/files/upload`，成功后：
     - 将 `KnowledgeFileDTO` 填入当前知识库的数据源。
     - 创建 `EventSource(/knowledge/files/{fileId}/events)`，根据事件更新 `status/progress/message/chunkCount`。
3. **Chunk/详情**
   - `ChunkDrawer` 需要后续 `GET /knowledge/files/{fileId}/chunks` 接口（当前缺失，联调前需补齐）；在 SSE `status=COMPLETED` 后才允许打开。
4. **发布**
   - `PublishDialog` 触发 `POST /knowledge/publish`，成功后刷新知识库状态；等待后台审核后通过 `listMyKnowledges` 获取最新状态。
5. **错误处理**
   - 上传失败（20 MB 限制、解析错误）通过 SSE `status=FAILED` + `message` 返回，前端需展示提示并允许重新上传。

### 4. 后端实现要点

1. **知识库应用服务**
   - `KnowledgeAppService` 已实现列表、文件创建/上传、发布提交 & 审核逻辑；提交时自动生成 `REVIEWING` 记录并将知识库状态置为 `SUBMITTED`。
2. **文件状态机**
   - `KnowledgeFileProcessingService` 采用多阶段执行：`UPLOADING/PENDING → SPLITTING → EMBEDDING → COMPLETED`。每个阶段独立的 `processSplittingStage` 与 `processEmbeddingStage`，状态变更和事件推送由统一的 `transition` 方法维护，失败时统一切换到 `FAILED` 并推送原因。
3. **配置**
   - 分块策略：`knowledge.chunk`（size/overlap/maxTokens）。
   - 嵌入模型：`knowledge.embedding`（protocol/baseUrl/apiKey/model/batchSize）。
4. **SSE**
   - `GET /knowledge/files/{fileId}/events` 返回标准 SSE，前端以 `EventSource` 订阅即可，事件 `id` 为时间戳，`event` 为当前状态名。

如需新增 Chunk 列表、重试等接口，可在现有状态机基础上扩展。当前文档覆盖了所有已开放端点及预期的前端适配方案。请根据此文档联调，后续若有接口变更再同步更新。*** End Patch
