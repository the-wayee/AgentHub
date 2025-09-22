package com.xiaoguai.agentx.application.conversation.service.agent.dto;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-09-22 17:00
 * @Description: AnalyzerMessageDTO
 */
public class AnalyzerMessageDTO {

    private boolean isQuestion;

    private String reply;

    public boolean isQuestion() {
        return isQuestion;
    }

    public void setQuestion(boolean question) {
        isQuestion = question;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}
