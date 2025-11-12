package com.xiaoguai.agentx.infrastrcture.converter;

import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgeFileStatus;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@MappedJdbcTypes(JdbcType.VARCHAR)
@MappedTypes(KnowledgeFileStatus.class)
public class KnowledgeFileStatusConverter extends BaseTypeHandler<KnowledgeFileStatus> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, KnowledgeFileStatus parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.name());
    }

    @Override
    public KnowledgeFileStatus getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : KnowledgeFileStatus.fromCode(value);
    }

    @Override
    public KnowledgeFileStatus getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : KnowledgeFileStatus.fromCode(value);
    }

    @Override
    public KnowledgeFileStatus getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : KnowledgeFileStatus.fromCode(value);
    }
}

