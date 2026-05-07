package com.harsh.Pixora.controller;

import com.harsh.Pixora.entity.Face;
import com.harsh.Pixora.entity.ImageListDTO;
import com.harsh.Pixora.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final ImageService imageService;

    @GetMapping("/process-photos")
    public String processImages() throws IOException {
        imageService.processImageFolder();
        return "done";
    }

    @GetMapping()
    public List<ImageListDTO> fetchImages(
            @RequestParam int page,
            @RequestParam int size
    ){
        return imageService.fetchImages(page,size);
    }

    @GetMapping("/by-face")
    public List<ImageListDTO> getImageByFace(@RequestParam String faceId){
        return imageService.searchImageByFace(faceId);
    }

    @GetMapping("by-tag")
    public List<ImageListDTO> getImageByTag(@RequestParam String tagName){
        return imageService.searchByTagName(tagName);
    }

    @GetMapping("/by-person")
    public List<ImageListDTO> getImageByPerson(@RequestParam String personName){
        return imageService.searchByPersonName(personName);
    }

    @GetMapping("/faces")
    public List<Face> getFaces(){
        return imageService.fetchAllFaces();
    }

    @PostMapping("/person-name")
    public ResponseEntity<Map<String, String>> setPersonName(@RequestParam String personName, @RequestParam String faceId){
         imageService.savePersonName(personName,faceId);
         return ResponseEntity.ok(Map.of("response", "Name saved successfully"));
    }
}
