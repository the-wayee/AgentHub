package com.xiaoguai.agentx.infrastrcture.s3;

/**
 * Simple descriptor for an object stored in OSS.
 */
public class S3ObjectReference {

    private final String objectKey;
    private final String fileUrl;
    private final String fileName;
    private final long size;

    public S3ObjectReference(String objectKey, String fileUrl, String fileName, long size) {
        this.objectKey = objectKey;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.size = size;
    }

    public String getObjectKey() {
        return objectKey;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public long getSize() {
        return size;
    }
}
