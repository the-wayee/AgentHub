package com.xiaoguai.agentx;

import com.xiaoguai.agentx.domain.tool.model.config.ToolDefinition;
import com.xiaoguai.agentx.infrastrcture.email.EmailService;
import com.xiaoguai.agentx.infrastrcture.utils.JsonUtils;
import dev.langchain4j.agent.tool.ToolSpecification;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.mcp.client.DefaultMcpClient;
import dev.langchain4j.mcp.client.transport.http.HttpMcpTransport;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.boot.test.context.SpringBootTest;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;

@SpringBootTest
class AgentHubApplicationTests {

    private static final Logger logger = LoggerFactory.getLogger(AgentHubApplicationTests.class);

    @Resource
    private EmailService emailService;


    @Test
    void testEmail() {
        emailService.sendVerificationEmail("2216783205@qq.com", "10086");
    }

    @Test
    void testMcpList() {
//        HttpMcpTransport transport = new HttpMcpTransport.Builder()
//                .sseUrl("http://localhost:8005/sse?api_key=123456&workspaceId=1")
//                .logRequests(true)
//                .logResponses(true)
//                .build();
//
//        DefaultMcpClient client = new DefaultMcpClient.Builder()
//                .transport(transport)
//                .build();
//
//        List<ToolSpecification> toolSpecifications = client.listTools();
//
//        toolSpecifications.forEach(each -> {
//            ToolDefinition toolDefinition = new ToolDefinition();
//            BeanUtils.copyProperties(each, toolDefinition);
//            System.out.println(JsonUtils.toJsonString(toolDefinition));
//        });
    }

    @Test
    void testEmbeddingPostgres() throws SQLException {
        // -------------------------------
        // 2️⃣ 创建 PgVector 向量存储
        // -------------------------------
        PgVectorEmbeddingStore store = PgVectorEmbeddingStore.builder()
                .host("localhost")
                .port(5432)
                .user("postgres")
                .password("postgres")
                .database("agenthub")
                .table("document_embeddings")
                .dimension(1024) // 与 embedding 模型一致
                .build();

        // -------------------------------
        // 3️⃣ 创建 Embedding 模型
        // -------------------------------
        EmbeddingModel embeddingModel = OpenAiEmbeddingModel.builder()
                .baseUrl("https://dashscope.aliyuncs.com/compatible-mode/v1")
                .apiKey("sk-6dc95137dedf4993a217fb19148aa330")
                .modelName("text-embedding-v4")
                .build();

        // -------------------------------
        // 4️⃣ 加载文档并拆分成 TextSegment
        // -------------------------------
        String data = "标题：探索京都：古都的文化与自然之美\n" +
                "\n" +
                "京都，日本曾经的帝国首都，是一座拥有超过一千年历史的城市。它以其众多的古典佛教寺庙、神道教神社、传统町屋建筑、精致的花园以及独特的文化遗产而闻名于世。春季，岚山的樱花如云似霞，吸引了无数游客；秋季，高雄山层林尽染，红叶美景令人叹为观止。游客可以漫步在哲学之道，感受宁静的氛围；也可以参观金阁寺，欣赏其金光闪闪的外观倒映在镜湖池中的绝景。京都不仅是历史的宝库，也是体验日本传统茶道、花道和怀石料理的绝佳之地。";
        Document doc = Document.from(data); // 本地文档
        DocumentSplitter splitter = DocumentSplitters.recursive(50, 20);// 每段 500 tokens，重叠 50
        List<TextSegment> segments = splitter.split(doc);

        System.out.println("文档拆分为 " + segments.size() + " 个片段");

        // -------------------------------
        // 5️⃣ 遍历 TextSegment -> 生成 Embedding -> 插入数据库
        // -------------------------------
        for (TextSegment segment : segments) {
            Embedding embedding = embeddingModel.embed(segment.text()).content();
            store.add(embedding, segment);
            System.out.println("已插入片段: " + segment.text().substring(0, Math.min(50, segment.text().length())) + "...");
        }

        System.out.println("所有片段已成功嵌入 PostgreSQL pgvector！");
    }

    @Test
    public void testEmbeddingSearch() {
        PgVectorEmbeddingStore store = PgVectorEmbeddingStore.builder()
                .host("localhost")
                .port(5432)
                .user("postgres")
                .password("postgres")
                .database("agenthub")
                .table("document_embeddings")
                .dimension(1024) // 与 embedding 模型一致
                .build();

        EmbeddingModel embeddingModel = OpenAiEmbeddingModel.builder()
                .baseUrl("https://dashscope.aliyuncs.com/compatible-mode/v1")
                .apiKey("sk-6dc95137dedf4993a217fb19148aa330")
                .modelName("text-embedding-v4")
                .build();

        // 京都是什么
        String query = "日本曾经的帝国首都是什么";
        TextSegment segment = TextSegment.from(query);
        Embedding embedding = embeddingModel.embed(segment).content();
        EmbeddingSearchRequest searchRequest = EmbeddingSearchRequest.builder()
                .queryEmbedding(embedding)
                .maxResults(2)
                .build();
        EmbeddingSearchResult<TextSegment> result = store.search(searchRequest);

        for (EmbeddingMatch<TextSegment> match : result.matches()) {
            System.out.println("match.embedded().text() = " + match.embedded().text());
        }
    }
}
