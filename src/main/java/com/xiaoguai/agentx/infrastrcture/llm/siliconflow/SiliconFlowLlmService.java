package com.xiaoguai.agentx.infrastrcture.llm.siliconflow;


import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.xiaoguai.agentx.domain.llm.model.LlmMessage;
import com.xiaoguai.agentx.domain.llm.model.LlmRequest;
import com.xiaoguai.agentx.domain.llm.model.LlmResponse;
import com.xiaoguai.agentx.infrastrcture.config.SiliconFlowProperties;
import com.xiaoguai.agentx.infrastrcture.llm.AbstractLlmService;
import jakarta.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-24 11:47
 * @Description: 硅基流动LLM服务
 */
@Service
public class SiliconFlowLlmService extends AbstractLlmService {
    @Resource
    private HttpClient httpClient;

    private static final Logger logger = LoggerFactory.getLogger(SiliconFlowLlmService.class);

    protected SiliconFlowLlmService(SiliconFlowProperties prop) {
        super(prop.getName(), prop.getApiUrl(), prop.getApiKey(), prop.getModel(), prop.getTimeout());
    }

    @Override
    public LlmResponse chat(LlmRequest request) {
        if (request.getModel() == null || "default".equals(request.getModel())) {
            logger.info("未指定模型，使用默认模型===>{}", getDefaultModel());
            request.setModel(getDefaultModel());
        }
        String requestJson = prepareRequestBody(request);
        String responseBody = sendHttpRequest(requestJson);
        return parseResponse(responseBody);
    }


    public void chatStreamList(LlmRequest request, StreamResponseHandler handler) {
        if (request.getModel() == null || "default".equals(request.getModel())) {
            logger.info("未指定模型，使用默认模型===>{}", getDefaultModel());
            request.setModel(getDefaultModel());
        }
        request.setStream(true);
        try {
            String requestJson = prepareRequestBody(request);
            senStreamChatRequest(requestJson, handler);
        } catch (Exception e) {
            logger.error("调用siliconFlow流式服务出错{}", e.getMessage());
            handler.onChunk("调用流式服务时发生错误：" + e.getMessage(), true);
        }
    }

    /**
     * 组装请求体
     */
    @Override
    public String prepareRequestBody(LlmRequest request) {
        JSONObject requestBody = new JSONObject();
        requestBody.put("model", request.getModel()); //设置模型

        JSONArray messageArray = new JSONArray();
        List<LlmMessage> messages = request.getMessages();
        for (LlmMessage message : messages) {
            JSONObject messageObject = new JSONObject();
            messageObject.put("role", message.getRole());
            messageObject.put("content", message.getContent());
            messageArray.add(messageObject);
        }

        requestBody.put("messages", messageArray);


        // 深度思考
//        requestBody.put("enable_thinking", false);

        // temperature
        if (request.getTemperature() != null) {
            requestBody.put("temperature", request.getTemperature());
        } else {
            requestBody.put("temperature", 0.7);
        }

        if (request.getMaxTokens() != null) {
            requestBody.put("max_tokens", request.getMaxTokens());
        }

        if (request.getStream() != null) {
            requestBody.put("stream", request.getStream());
        } else {
            requestBody.put("stream", false); // 默认非流式
        }

        return requestBody.toJSONString();
    }


    private String sendHttpRequest(String requestJson) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                logger.error("HTTP请求失败，状态码: {}", response.statusCode());
            }
            return response.body();
        } catch (Exception e) {
            logger.error("消息发送失败 =========>{}", e.getMessage());
            return null;
        }
    }

    @Override
    public LlmResponse parseResponse(String responseBody) {
        JSONObject responseJson = JSON.parseObject(responseBody);
        LlmResponse response = new LlmResponse();
        response.setProvider(getProvideeName());
        response.setModel(getDefaultModel());

        try {
            JSONObject choices = responseJson.getJSONArray("choices").getJSONObject(0);
            JSONObject message = choices.getJSONObject("message");
            response.setContent(message.getString("content"));
            response.setFinishReason(choices.getString("finish_reason"));

            if (responseJson.containsKey("usage")) {
                JSONObject usage = responseJson.getJSONObject("usage");
                response.setTokenUsage(usage.getInteger("total_tokens"));
            }
            return response;
        } catch (Exception e) {
            logger.error("解析硅基流动响应失败", e);
            response.setContent("解析服务响应时发生错误: " + e.getMessage());
            return response;
        }
    }


    @FunctionalInterface
    public interface StreamResponseHandler {

        /**
         * 处理流式分块
         */
        void onChunk(String chunk, boolean isLast);
    }


    private void senStreamChatRequest(String requestJson, StreamResponseHandler handler) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .build();

        try {
            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() != 200) {
                logger.error("===>获取流式响应失败:{}", response.body());
                return;
            }
            BufferedReader reader = new BufferedReader(new InputStreamReader(response.body(), StandardCharsets.UTF_8));
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isEmpty()) {
                    continue;
                }
                line = line.trim();
                if (line.startsWith("data: ")) {
                    line = line.substring("data: ".length());

                    if ("[DONE]".equals(line)) {
                        // 最后一个
                        handler.onChunk("", true);
                        break;
                    }
                    // 解析数据
                    JSONObject data = JSON.parseObject(line);
                    if (data.containsKey("choices") && !data.getJSONArray("choices").isEmpty()) {
                        JSONObject choice = data.getJSONArray("choices").getJSONObject(0);
                        if (choice.containsKey("delta")) {
                            JSONObject delta = choice.getJSONObject("delta");
                            if (delta.containsKey("content")) {
                                String content = delta.getString("content");
                                handler.onChunk(content, false);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("===>解析流式响应数据错误:{}", e.getMessage());
            throw new RuntimeException(e);
        }

    }
}
