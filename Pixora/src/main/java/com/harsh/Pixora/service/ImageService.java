package com.harsh.Pixora.service;


import com.harsh.Pixora.entity.Face;
import com.harsh.Pixora.entity.ImageFace;
import com.harsh.Pixora.entity.ImageInfo;
import com.harsh.Pixora.entity.ImageListDTO;
import com.harsh.Pixora.ingestion.PhotoIngestionService;
import com.harsh.Pixora.repository.FaceRepository;
import com.harsh.Pixora.repository.ImageFaceRepository;
import com.harsh.Pixora.repository.ImageInfoRepository;
import com.harsh.Pixora.repository.ImageTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final PhotoIngestionService photoIngestionService;
    private final ImageInfoRepository infoRepository;
    private final FaceRepository faceRepository;
    @Value("${photo.folder.paths}")
    private List<String> folderPaths;
    private final AtomicBoolean ingestionRunning = new AtomicBoolean(false);

    @Async("ingestionExecutor")
    public void processImageFolderAsync() throws IOException {
        try {
            System.out.println("ingestion started");
            photoIngestionService.startIngestion(folderPaths.getFirst());
            System.out.println("ingestion completed");
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            ingestionRunning.set(false);
        }
    }

    public String processImageFolder() throws IOException {
        if(!ingestionRunning.compareAndSet(false,true)){
            return "Ingestion already running...";
        }
        processImageFolderAsync();

        return "Ingestion started successfully";
    }

    public List<ImageListDTO> fetchImages(int page, int size){
        Pageable pageable = PageRequest.of(page,size);
        return infoRepository.findAllImages(pageable).stream().map(r -> new ImageListDTO(
                ((Number) r[0]).longValue(),
                (String) r[1]
        )).toList();
    }

    public List<ImageListDTO> searchImageByFace(String faceId){
        return infoRepository.findImagesByFaceId(Long.valueOf(faceId)).stream().map(r ->
             new ImageListDTO(
                    ((Number) r[0]).longValue(),
                    (String) r[1]
           )).toList();
        }

        public List<ImageListDTO>searchByTagName(String tagname){
            return infoRepository.findImagesByTag(tagname).stream().map(r -> new ImageListDTO(
                    ((Number) r[0]).longValue(),
                    (String) r[1]
            )).toList();
        }

    public List<ImageListDTO>searchByPersonName(String personName){
        return infoRepository.findImagesByPersonName(personName).stream().map(r -> new ImageListDTO(
                ((Number) r[0]).longValue(),
                (String) r[1]
        )).toList();
    }
    public void savePersonName(String personName,String faceId){
        faceRepository.updatePersonNameById(Long.valueOf(faceId),personName);
    }

    public List<Face> fetchAllFaces(){
        return faceRepository.findAll();

    }

}
