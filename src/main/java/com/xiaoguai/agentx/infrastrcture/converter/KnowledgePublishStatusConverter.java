package com.xiaoguai.agentx.infrastrcture.converter;

import com.xiaoguai.agentx.domain.knowledge.constants.KnowledgePublishStatus;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@MappedJdbcTypes(JdbcType.VARCHAR)
@MappedTypes(KnowledgePublishStatus.class)
public class KnowledgePublishStatusConverter extends BaseTypeHandler<KnowledgePublishStatus> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, KnowledgePublishStatus parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.name());
    }

    @Override
    public KnowledgePublishStatus getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : KnowledgePublishStatus.fromCode(value);
    }

    @Override
    public KnowledgePublishStatus getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : KnowledgePublishStatus.fromCode(value);
    }

    @Override
    public KnowledgePublishStatus getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : KnowledgePublishStatus.fromCode(value);
    }
}

