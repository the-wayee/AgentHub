package com.xiaoguai.agentx.infrastrcture.domain;


import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-08-13 09:14
 * @Description: 带有额外功能的Mapper
 */
public interface ExtraMapper<T> extends BaseMapper<T> {

    /**
     * 带检查的更新
     */
    default void checkUpdate(T entity, Wrapper<T> wrapper) {
        int update = update(entity, wrapper);
        if (update == 0) {
            throw new BusinessException("数据更新失败");
        }
    }

    default void checkUpdate(Wrapper<T> wrapper) {
        int update = update(wrapper);
        if (update == 0) {
            throw new BusinessException("数据更新失败");
        }
    }

    default void checkUpdateById(T entity) {
        int update = updateById(entity);
        if (update == 0) {
            throw new BusinessException("数据更新失败");
        }
    }

    /**
     * 带检查删除
     */
    default void checkDelete(Wrapper<T> wrapper) {
        int delete = delete(wrapper);
        if (delete == 0) {
            throw new BusinessException("数据删除失败");
        }
    }

    default void checkDeleteById(T entity) {
        int delete = deleteById(entity);
        if (delete == 0) {
            throw new BusinessException("数据删除失败");
        }
    }
}
