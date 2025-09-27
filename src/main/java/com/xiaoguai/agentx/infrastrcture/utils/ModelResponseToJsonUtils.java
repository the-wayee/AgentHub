package com.xiaoguai.agentx.infrastrcture.utils;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-27 11:28
 * @Description:
 */
public class ModelResponseToJsonUtils {
    public static <T> T toJson(String text,Class<T> classz) {
        String json = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        return JsonUtils.parseObject(json,classz);
    }
}
