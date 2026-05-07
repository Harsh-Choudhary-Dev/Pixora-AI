package com.harsh.Pixora.controller;


import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;

@RestController
@RequestMapping("/media")
@CrossOrigin(origins = "*") // allow frontend
public class MediaController {

    private static final Set<String> SUPPORTED_IMAGE_EXTENSIONS = Set.of(
            "jpg",
            "jpeg",
            "png"
    );

    public String getExtension(String filename){
        int index = filename.lastIndexOf(".");
        return index > 0 ?  filename.substring(index+1): "";
    }

    @GetMapping("/file")
    public ResponseEntity<Resource> getFile(@RequestParam String path) {

        try {
            // 🔥 decode URL (important for spaces)
            String decodedPath = URLDecoder.decode(path, StandardCharsets.UTF_8);

            Path filePath = Paths.get(decodedPath);

            // 🔴 Security check (VERY IMPORTANT)
            if (!SUPPORTED_IMAGE_EXTENSIONS.contains(getExtension(filePath.toString()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // 🔥 detect file type dynamically
            String contentType = Files.probeContentType(filePath);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            contentType != null ? contentType : "application/octet-stream"
                    ))
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
