package com.xiaoguai.agentx;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan(basePackages = "com.xiaoguai.agentx.domain.conversation.repository")
public class AgentXApplication {
    public static void main(String[] args) {
        SpringApplication.run(AgentXApplication.class, args);
    }

}
