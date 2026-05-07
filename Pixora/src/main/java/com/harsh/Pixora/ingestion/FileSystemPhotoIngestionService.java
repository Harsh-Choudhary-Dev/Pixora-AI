package com.harsh.Pixora.ingestion;

import com.harsh.Pixora.entity.Face;
import com.harsh.Pixora.entity.ImageFace;
import com.harsh.Pixora.entity.ImageInfo;
import com.harsh.Pixora.entity.ImageTag;
import com.harsh.Pixora.repository.FaceRepository;
import com.harsh.Pixora.repository.ImageFaceRepository;
import com.harsh.Pixora.repository.ImageInfoRepository;
import com.harsh.Pixora.repository.ImageTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.stereotype.Component;


import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.stream.Stream;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileSystemPhotoIngestionService implements PhotoIngestionService{
    private final ImageProcessingClient imageProcessingClient;
    private final ImageInfoRepository infoRepository;
    private final ImageFaceRepository imageFaceRepository;
    private final FaceRepository faceRepository;
    private final BlockingQueue<Path> queue = new LinkedBlockingQueue<>(50);
    private final BlockingQueue<List> apiResponse = new LinkedBlockingQueue<>(50);
    private static final int BATCH_SIZE = 8;
    private static final int API_WORKERS = 3;
    private static final int DB_WORKERS = 2;
    private final ExecutorService executor = Executors.newFixedThreadPool(API_WORKERS + DB_WORKERS + 1);

    private static final Path POISON_PILL = Paths.get("__POISON__");
    private static final Set<String> SUPPORTED_IMAGE_EXTENSIONS = Set.of(
            "jpg",
            "jpeg",
            "png"
    );

    private String encode(String path) {
        try {
            return URLEncoder.encode(path, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("e: ", e);
        }
        return path;
    }



    @SuppressWarnings("unchecked")
    public void saveImageData(List<Map<String, Object>> processedImages) {
        List<ImageInfo> listImageInfo = new ArrayList<>();
        List<ImageTag> tagEntities = new ArrayList<>();
        for (Map<String, Object> batch : processedImages){
            List<Map<String, Object>> processedList = (List<Map<String, Object>>) batch.get("processed");
            for (Map<String, Object> image : processedList) {
//                String imageId = (String) image.get("info_id");
                ImageInfo imageInfo = new ImageInfo();
//                imageInfo.setId(imageId);
                imageInfo.setOriginalImage("/media/file?path=" +  encode(image.get("original_image").toString()));
                List<ImageFace> imageFaces = new ArrayList<>();
                String facePath = (String) image.get("faceimage_path");
                if (facePath != null){
                    Face face = faceRepository.findByFaceImagePath(facePath)
                            .orElseGet(() -> {
                                Face newFace = new Face();
                                newFace.setPersonName((String) image.get("person_name"));
                                newFace.setFace_image_path("/media/file?path=" + encode((String) image.get("faceimage_path")));
                                return faceRepository.save(newFace);
                            });
                    ImageFace imageFace = new ImageFace();
                    imageFace.setImageInfo(imageInfo);
                    imageFace.setFace(face);
                    imageFaces.add(imageFace);
                }
                imageInfo.setImageFaces(imageFaces);

                List<String> tags = (List<String>) image.get("image_tags");
                for (String tag : tags) {
                    ImageTag tagEntity = new ImageTag();
                    tagEntity.setTag(tag.trim());
                    tagEntity.setImageInfo(imageInfo);
                    tagEntities.add(tagEntity);
                }

                imageInfo.setTags(tagEntities);
                listImageInfo.add(imageInfo);

            }
        }
        infoRepository.saveAll(listImageInfo);
    }

    public String getExtension(String filename){
        int index = filename.lastIndexOf(".");
        return index > 0 ?  filename.substring(index+1): "";
    }

    public boolean isImageFile(Path path){
        String filename = String.valueOf(path.getFileName());
        String extension = getExtension(filename).toLowerCase();
        return SUPPORTED_IMAGE_EXTENSIONS.contains(extension);
    }

    public void startIngestion(String folderPath) throws IOException {
        executor.submit(() -> {
            try(Stream<Path> paths = Files.walk(Paths.get(folderPath))){
                paths.filter(Files :: isRegularFile)
                        .filter(this :: isImageFile)
                        .forEach(path -> {
                            try{
                                queue.put(path);
                            }catch(InterruptedException e){
                                e.printStackTrace();
                            }
                        });

                for (int i = 0; i < API_WORKERS; i++) {
                    queue.put(POISON_PILL);
                }
            }catch(Exception e){
                e.printStackTrace();
            }

        });
        for (int i = 0; i < API_WORKERS; i++) {
            executor.submit(() -> {
                try {
                    while (true) {
                        List<Path> batch = new ArrayList<>();
                        Path first = queue.take();
                        if (first.equals(POISON_PILL)) {
                            System.out.println(Thread.currentThread().getName() + " stopping...");
                            apiResponse.put(Collections.emptyList()); // signal DB
                            break;
                        }
                        batch.add(first);
                        queue.drainTo(batch, BATCH_SIZE - 1);
                        batch.removeIf(p -> p.equals(POISON_PILL));

                        if (!batch.isEmpty()) {
                            List<Map<String, Object>> processedImages = imageProcessingClient.processBatch(batch);
                            apiResponse.put(processedImages);
                        }
                    }
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            });
        };
        for (int i = 0; i < DB_WORKERS; i++) {
            executor.submit(() -> {
                try {
                    while (true) {

                        List<Map<String, Object>> results = apiResponse.take();

                        // 🛑 Stop condition
                        if (results.isEmpty()) {
                            break;
                        }

                        saveImageData(results);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }
    }
    }

