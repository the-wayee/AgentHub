package com.xiaoguai.agentx.infrastrcture.converter;

import com.xiaoguai.agentx.domain.knowledge.constants.Visibility;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@MappedJdbcTypes(JdbcType.VARCHAR)
@MappedTypes(Visibility.class)
public class KnowledgeVisibilityConverter extends BaseTypeHandler<Visibility> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Visibility parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.name());
    }

    @Override
    public Visibility getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : Visibility.fromCode(value);
    }

    @Override
    public Visibility getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : Visibility.fromCode(value);
    }

    @Override
    public Visibility getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : Visibility.fromCode(value);
    }
}

