package com.xiaoguai.agentx.infrastrcture.converter;


import org.apache.ibatis.type.MappedTypes;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 20:02
 * @Description: ListStringConverter
 */
@MappedTypes(List.class)
public class ListStringConverter extends JsonToStringConverter<List<String>> {

    public ListStringConverter() {
        super((Class<List<String>>) (Class<?>) List.class);
    }
}
