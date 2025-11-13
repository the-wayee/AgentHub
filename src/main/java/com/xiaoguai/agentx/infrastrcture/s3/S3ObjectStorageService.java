package com.xiaoguai.agentx.infrastrcture.s3;


import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSException;
import com.aliyun.oss.model.ObjectMetadata;
import com.aliyun.oss.model.OSSObject;
import com.xiaoguai.agentx.infrastrcture.config.S3Properties;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

/**
 * Uploads and downloads binary objects through the configured OSS client.
 */
@Component
public class S3ObjectStorageService {

    private static final String HTTPS_PREFIX = "https://";
    private final OSS ossClient;
    private final S3Properties s3Properties;

    public S3ObjectStorageService(OSS ossClient, S3Properties s3Properties) {
        this.ossClient = ossClient;
        this.s3Properties = s3Properties;
    }

    /**
     * Uploads a multipart file into OSS using the provided directory prefix.
     */
    public S3ObjectReference upload(String directory, MultipartFile file) {
        try (InputStream inputStream = new BufferedInputStream(file.getInputStream())) {
            String safeDir = normalizeDirectory(directory);
            String originalName = extractOriginalName(file.getOriginalFilename());
            String key = safeDir + UUID.randomUUID() + "_" + originalName.replaceAll("\\s+", "_");

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            ossClient.putObject(getBucketName(), key, inputStream, metadata);

            return new S3ObjectReference(key, buildFileUrl(key), originalName, file.getSize());
        } catch (IOException | OSSException ex) {
            throw new BusinessException("上传文件到对象存储失败: " + ex.getMessage());
        }
    }

    private String extractOriginalName(String rawName) {
        if (rawName == null || rawName.isEmpty()) {
            return "unknown";
        }
        try {
            Path path = Paths.get(rawName);
            return path.getFileName().toString();
        } catch (Exception ex) {
            return "unknown";
        }
    }

    /**
     * Opens the stored object as an input stream, caller must close the stream.
     */
    public InputStream openStream(String objectKey) {
        OSSObject ossObject = ossClient.getObject(getBucketName(), objectKey);
        return new BufferedInputStream(ossObject.getObjectContent());
    }

    /**
     * Extracts the object key from the full URL returned to clients.
     */
    public String extractObjectKey(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            throw new BusinessException("文件链接无效");
        }
        String normalized = fileUrl.matches("^https?://.*") ? fileUrl : HTTPS_PREFIX + fileUrl;
        URI uri = URI.create(normalized);
        return uri.getPath().startsWith("/") ? uri.getPath().substring(1) : uri.getPath();
    }

    private String normalizeDirectory(String directory) {
        if (directory == null || directory.isEmpty()) {
            return "";
        }
        String normalized = directory;
        if (!normalized.endsWith("/")) {
            normalized = normalized + "/";
        }
        if (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        return normalized;
    }

    private String buildFileUrl(String key) {
        String endpoint = s3Properties.getProviderProperties().getEndpoint();
        String host = endpoint.replaceFirst("^https?://", "");
        return HTTPS_PREFIX + getBucketName().toLowerCase(Locale.ROOT) + "." + host + "/" + key;
    }

    private String getBucketName() {
        return s3Properties.getProviderProperties().getBucketName();
    }
}
