package com.xiaoguai.agentx.interfaces.dto.tool;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-07 21:28
 * @Description: 更新工具请求
 */
public class UpdateToolRequest {

    @NotBlank(message = "工具名称不能为空")
    private String name;

    /**
     * 图标
     */
    private String icon;

    /**
     * 副标题
     */
    @NotBlank(message = "副标题不能为空")
    private String subtitle;

    @NotBlank(message = "工具描述不能为空")
    private String description;

    @NotEmpty(message = "标签不能为空")
    private List<String> labels;

    @NotBlank(message = "上传地址不能为空")
    private String uploadUrl;

    @NotNull(message = "安装命令不能为空")
    private Map<String, Object> installCommand;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }

    public String getUploadUrl() {
        return uploadUrl;
    }

    public void setUploadUrl(String uploadUrl) {
        this.uploadUrl = uploadUrl;
    }

    public Map<String, Object> getInstallCommand() {
        return installCommand;
    }

    public void setInstallCommand(Map<String, Object> installCommand) {
        this.installCommand = installCommand;
    }
}
