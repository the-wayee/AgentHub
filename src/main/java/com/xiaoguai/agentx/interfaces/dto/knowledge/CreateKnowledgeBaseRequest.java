package com.xiaoguai.agentx.interfaces.dto.knowledge;

import com.xiaoguai.agentx.domain.knowledge.constants.Visibility;
import jakarta.validation.constraints.NotBlank;

public class CreateKnowledgeBaseRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String description;
    // 默认不可见
    private Visibility visibility = Visibility.PRIVATE;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Visibility getVisibility() {
        return visibility;
    }

    public void setVisibility(Visibility visibility) {
        this.visibility = visibility;
    }
}

