package com.xiaoguai.agentx.infrastrcture.converter;


import com.xiaoguai.agentx.domain.conversation.constants.MessageType;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-08 11:26
 * @Description: 消息类型枚举转换器
 */
@MappedJdbcTypes(JdbcType.VARCHAR)
@MappedTypes(MessageType.class)
public class MessageTypeConverter extends BaseTypeHandler<MessageType> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, MessageType parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.name());
    }

    @Override
    public MessageType getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : MessageType.valueOf(value);
    }

    @Override
    public MessageType getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : MessageType.valueOf(value);
    }

    @Override
    public MessageType getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : MessageType.valueOf(value);
    }
}