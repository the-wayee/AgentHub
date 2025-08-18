package com.xiaoguai.agentx.infrastrcture.converter;


import com.xiaoguai.agentx.domain.agent.constant.AgentType;
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
 * @Date: 2025-08-18 14:59
 * @Description: AgentTypeConverter
 */
@MappedJdbcTypes({JdbcType.VARCHAR})
@MappedTypes(AgentType.class)
public class AgentTypeConverter extends BaseTypeHandler<AgentType> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, AgentType parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.name());
    }

    @Override
    public AgentType getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : AgentType.fromType(value);
    }

    @Override
    public AgentType getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : AgentType.fromType(value);
    }

    @Override
    public AgentType getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : AgentType.fromType(value);
    }
}
