package com.harsh.Pixora.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "image_info")
@Data
public class ImageInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "original_image")
    private String originalImage;

    @OneToMany(mappedBy = "imageInfo", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ImageFace> imageFaces;

    @OneToMany(mappedBy = "imageInfo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ImageTag> tags;

}
