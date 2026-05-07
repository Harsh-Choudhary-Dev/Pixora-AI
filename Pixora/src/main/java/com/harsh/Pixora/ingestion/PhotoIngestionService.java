package com.harsh.Pixora.ingestion;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

public interface PhotoIngestionService {
    void startIngestion(String folderPath) throws IOException;
    boolean isImageFile(Path path);
    String getExtension(String filename);
}
