package com.harsh.Pixora.ingestion;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

public interface ImageProcessingClient {
    List<Map<String, Object>> processBatch(List<Path> imagePaths);
}
