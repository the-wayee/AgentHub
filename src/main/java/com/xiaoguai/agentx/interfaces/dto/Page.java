package com.xiaoguai.agentx.interfaces.dto;


/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-08 21:50
 * @Description: Page
 */
public class Page {

    private int current;

    private int size;

    public int getCurrent() {
        return current;
    }

    public void setCurrent(int current) {
        this.current = current;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }
}
