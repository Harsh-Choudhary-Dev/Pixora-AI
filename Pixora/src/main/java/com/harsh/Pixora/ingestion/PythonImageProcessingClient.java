package com.harsh.Pixora.ingestion;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@Component
public class PythonImageProcessingClient implements ImageProcessingClient{

    private final WebClient webClient;

    public PythonImageProcessingClient(WebClient.Builder builder, @Value("${image.python.port}") String url) {
        this.webClient = builder
                .baseUrl(url) // your Python API
                .build();
    }

    @Override
    public List processBatch(List<Path> imagePaths) {

        return webClient.post()
                .uri("/process_batch")
                .bodyValue(Map.of("images_path",imagePaths))
                .retrieve()
                .bodyToMono(List.class)
                .block();
    }

}
