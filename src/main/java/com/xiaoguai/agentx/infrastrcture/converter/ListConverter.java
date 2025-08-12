package com.xiaoguai.agentx.infrastrcture.converter;


import org.apache.ibatis.type.MappedTypes;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-12 20:33
 * @Description: 模型配置转换器
 */
@MappedTypes(List.class)
public class ListConverter extends JsonToStringConverter<List> {

    public ListConverter() {
        super(List.class);
    }
}