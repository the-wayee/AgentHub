package com.xiaoguai.agentx.domain.agent.repository;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaoguai.agentx.domain.agent.model.AgentVersionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-07-28 16:49
 * @Description: Agent版本仓库
 */
@Mapper
public interface AgentVersionRepository extends BaseMapper<AgentVersionEntity> {

    /**
     * 根据name和status模糊查询最新版的agents version
     */
    @Select({"<script> ",
            "select v.* from agent_versions v inner join (",
            "    select agent_id, MAX(published_at) as latest_date from agent_versions where deleted_at is null ",
            "<if test='status != null'>",
            "      and publish_status = #{name} ",
            "</if>",
            "    group by agent_id " +
                    ") latest_version on v.agent_id = latest_version.agent_id and v.published_at = latest_version.latest_date ",
            "where v.deleted_at is null ",
            "<if test='name != null and name != \"\"'>",
            "and v.name like contact('%', #{name}, '%')",
            "</if>",
            "<if test='status != null'>",
            "    AND v.publish_status = #{status}",
            "</if>",
            "</script>"})
    List<AgentVersionEntity> selectLatestVersionsByNameAndStatus(String name, Integer status);

    /**
     * 根据status模糊查询最新版的agents version
     */
    @Select({"<script>",
            "SELECT a.* FROM agent_versions a ",
            "INNER JOIN (SELECT agent_id, MAX(published_at) as max_published_at ",
            "FROM agent_versions ",
            "<if test='publishStatus != null'> WHERE publish_status = #{publishStatus} </if>",
            "GROUP BY agent_id) b ",
            "ON a.agent_id = b.agent_id AND a.published_at = b.max_published_at ",
            "<if test='publishStatus != null'> WHERE a.publish_status = #{publishStatus} </if>",
            "</script>"})
    List<AgentVersionEntity> selectLatestVersionsByStatus(Integer status);
}
