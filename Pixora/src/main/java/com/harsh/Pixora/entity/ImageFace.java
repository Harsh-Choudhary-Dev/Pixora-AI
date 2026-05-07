package com.harsh.Pixora.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ImageFace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "image_id")
    @JsonBackReference
    private ImageInfo imageInfo;

    @ManyToOne
    @JoinColumn(name = "face_id")
    private Face face;
}
