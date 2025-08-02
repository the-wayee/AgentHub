package com.xiaoguai.agentx.infrastrcture.llm;


import com.xiaoguai.agentx.domain.llm.model.LlmRequest;
import com.xiaoguai.agentx.domain.llm.model.LlmResponse;
import com.xiaoguai.agentx.domain.llm.service.LlmService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-23 20:37
 * @Description: AbstractLlmService
 */
public abstract class AbstractLlmService implements LlmService {

    private final Logger logger = LoggerFactory.getLogger(getClass());
    /**
     * 供应商名称
     */
    protected final String providerName;

    /**
     * API URL
     */
    protected final String apiUrl;

    /**
     * API Key
     */
    protected final String apiKey;

    /**
     * 默认模型
     */
    protected final String defaultModel;

    /**
     * 超时时间(毫秒)
     */
    protected final int timeout;


    protected AbstractLlmService(String providerName, String apiUrl, String apiKey, String defaultModel, int timeout) {
        this.providerName = providerName;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.defaultModel = defaultModel;
        this.timeout = timeout;
    }


    @Override
    public List<String> chatStreamList(LlmRequest request) {
        logger.warn("使用默认流式响应实现（非真正流式），建议子类覆盖此方法提供真正的流式实现");
        LlmResponse response = chat(request);
        String content = response.getContent();
        return splitIntoChunks(content);
    }

    /**
     * 将文本分割成小块，用于模拟流式响应
     *
     * @param text 完整文本
     * @return 分割后的文本块
     */
    private List<String> splitIntoChunks(String text) {
        List<String> chunks = new ArrayList<>();

        // 如果文本为空，返回空列表
        if (text == null || text.isEmpty()) {
            return chunks;
        }

        // 更简单的方法：直接按字符分割，特别处理标点符号
        StringBuilder currentChunk = new StringBuilder();

        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            currentChunk.append(c);

            // 如果是中文标点或英文标点，且不是最后一个字符，则作为分隔点
            if ((isPunctuation(c) || i % 3 == 2) && i < text.length() - 1) {
                chunks.add(currentChunk.toString());
                currentChunk = new StringBuilder();
            }
        }

        // 添加剩余内容
        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString());
        }

        return chunks;
    }

    /**
     * 判断字符是否为标点符号
     */
    private boolean isPunctuation(char c) {
        // 中文标点范围
        if ((c >= 0x3000 && c <= 0x303F) || // CJK标点符号
                (c >= 0xFF00 && c <= 0xFF0F) || // 全角ASCII标点
                (c >= 0xFF1A && c <= 0xFF20) || // 全角ASCII标点
                (c >= 0xFF3B && c <= 0xFF40) || // 全角ASCII标点
                (c >= 0xFF5B && c <= 0xFF65)) { // 全角ASCII标点
            return true;
        }

        // 英文标点
        return c == '.' || c == ',' || c == '!' || c == '?' ||
                c == ';' || c == ':' || c == ')' || c == ']' || c == '}';
    }

    @Override
    public String getProviderName() {
        return providerName;
    }

    @Override
    public String getDefaultModel() {
        return defaultModel;
    }

    /**
     * 准备请求体，将通用请求转为服务商特定格式
     */
    protected abstract String prepareRequestBody(LlmRequest request);

    /**
     * 解析响应，将服务商特定格式转为通用响应
     */
    protected abstract LlmResponse parseResponse(String responseBody);
}
