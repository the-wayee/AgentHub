package com.xiaoguai.agentx;

import dev.langchain4j.community.model.dashscope.QwenChatModel;
import dev.langchain4j.community.model.dashscope.QwenChatRequestParameters;
import dev.langchain4j.community.model.dashscope.QwenStreamingChatModel;
import dev.langchain4j.community.model.qianfan.QianfanChatModel;
import dev.langchain4j.community.model.zhipu.ZhipuAiStreamingChatModel;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.PartialThinking;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.concurrent.CountDownLatch;

@SpringBootTest
class AgentXApplicationTests {

    private static final Logger logger = LoggerFactory.getLogger(AgentXApplicationTests.class);

    @Test
    void contextLoads() throws InterruptedException {
        StreamingChatModel model = QwenStreamingChatModel.builder()
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
//                .baseUrl("https://dashscope.aliyuncs.com/compatible-mode/v1")
//                .baseUrl("https://api.siliconflow.cn/v1")
//                .modelName("Qwen/Qwen3-32B")
                .modelName("qwen-plus")
                .build();
        String message = "你好，你叫什么";


        UserMessage userMessage = UserMessage.from(message);
        QwenChatRequestParameters parameters = QwenChatRequestParameters.builder()
                .enableThinking(true)
                .build();


        ChatRequest request = ChatRequest.builder()
                .messages(userMessage)
                .parameters(parameters)
                .build();

        CountDownLatch latch = new CountDownLatch(1);


        model.chat(request, new StreamingChatResponseHandler() {
            @Override
            public void onPartialResponse(String response) {
                System.out.println("response = " + response);
            }

            @Override
            public void onCompleteResponse(ChatResponse completeResponse) {
                System.out.println("Done = " + completeResponse.aiMessage().text());
                latch.countDown();
            }

            @Override
            public void onError(Throwable error) {

            }

            @Override
            public void onPartialThinking(PartialThinking partialThinking) {
                String think = partialThinking.text();
                System.out.println("think = " + think);
            }
        });

        latch.await();
    }

    @Test
    void testChat() {
        QwenChatModel model = QwenChatModel.builder()
                .modelName("Qwen/Qwen3-32B")
                .apiKey(System.getenv("SILICONFLOW_API_KEY"))
                .baseUrl("https://api.siliconflow.cn/v1")
                .build();
        String response = model.chat("你好");
        System.out.println("response = " + response);
    }

    @Test
    void testQwen() {
        QwenChatModel qwenChatModel = QwenChatModel.builder()
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .modelName("qwen-max")
                .build();
        String chat = qwenChatModel.chat("你好");
        System.out.println("chat = " + chat);
    }

    @Test
    void testZhipu() throws InterruptedException {
        ZhipuAiStreamingChatModel model = ZhipuAiStreamingChatModel.builder()
                .apiKey(System.getenv("CHATGLM_API_KEY"))
                .model("glm-4-9b")
                .build();

        String message = "你好，你叫什么";


        UserMessage userMessage = UserMessage.from(message);
        QwenChatRequestParameters parameters = QwenChatRequestParameters.builder()
                .enableThinking(true)
                .build();


        ChatRequest request = ChatRequest.builder()
                .messages(userMessage)
                .parameters(parameters)
                .build();

        CountDownLatch latch = new CountDownLatch(1);


        model.chat(request, new StreamingChatResponseHandler() {
            @Override
            public void onPartialResponse(String response) {
                System.out.println("response = " + response);
            }

            @Override
            public void onCompleteResponse(ChatResponse completeResponse) {
                System.out.println("Done = " + completeResponse.aiMessage().text());
                latch.countDown();
            }

            @Override
            public void onError(Throwable error) {

            }

            @Override
            public void onPartialThinking(PartialThinking partialThinking) {
                String think = partialThinking.text();
                System.out.println("think = " + think);
            }
        });

        latch.await();
    }

}
