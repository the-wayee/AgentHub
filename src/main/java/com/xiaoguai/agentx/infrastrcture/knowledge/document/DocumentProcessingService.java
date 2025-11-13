package com.xiaoguai.agentx.infrastrcture.knowledge.document;


import com.xiaoguai.agentx.infrastrcture.config.KnowledgeChunkProperties;
import com.xiaoguai.agentx.infrastrcture.exception.BusinessException;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentParser;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.parser.TextDocumentParser;
import dev.langchain4j.data.document.parser.apache.poi.ApachePoiDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;
import java.util.Locale;

/**
 * Wraps LangChain4J document parsers and splitters so we do not hand-craft processing logic.
 */
@Component
public class DocumentProcessingService {

    private final KnowledgeChunkProperties chunkProperties;
    private final DocumentParser textParser = new TextDocumentParser();
//    private final DocumentParser pdfParser = new PdfBoxDocumentParser();
    private final DocumentParser officeParser = new ApachePoiDocumentParser();

    public DocumentProcessingService(KnowledgeChunkProperties chunkProperties) {
        this.chunkProperties = chunkProperties;
    }

    public List<TextSegment> parseAndSplit(InputStream inputStream, String fileType) {
        try {
            DocumentParser parser = resolveParser(fileType);
            Document document = parser.parse(inputStream);
            DocumentSplitter splitter = DocumentSplitters.recursive(
                    chunkProperties.getSize(),
                    chunkProperties.getOverlap()
            );
            return splitter.split(document);
        } catch (Exception ex) {
            throw new BusinessException("文档解析失败: " + ex.getMessage());
        }
    }

    private DocumentParser resolveParser(String fileType) {
        String normalized = normalizeFileType(fileType);
        return switch (normalized) {
//            case "pdf" -> pdfParser;
            case "doc", "docx", "ppt", "pptx", "xls", "xlsx" -> officeParser;
            default -> textParser;
        };
    }

    private String normalizeFileType(String fileType) {
        if (fileType == null || fileType.isEmpty()) {
            return "";
        }
        return fileType.toLowerCase(Locale.ROOT);
    }
}
