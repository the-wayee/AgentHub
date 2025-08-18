package com.xiaoguai.agentx.infrastrcture.converter;


import com.xiaoguai.agentx.domain.llm.model.enums.ModelType;
import com.xiaoguai.agentx.infrastrcture.llm.protocol.enums.ProviderProtocol;
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
 * @Date: 2025-08-12 20:35
 * @Description: ModelTypeConverter
 */
@MappedJdbcTypes(JdbcType.VARCHAR)
@MappedTypes(ModelType.class)
public class ModelTypeConverter extends BaseTypeHandler<ModelType> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, ModelType parameter, JdbcType jdbcType)
            throws SQLException {
        ps.setString(i, parameter.name());
    }

    @Override
    public ModelType getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : ModelType.fromCode(value);
    }

    @Override
    public ModelType getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : ModelType.fromCode(value);
    }

    @Override
    public ModelType getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : ModelType.fromCode(value);
    }
}
