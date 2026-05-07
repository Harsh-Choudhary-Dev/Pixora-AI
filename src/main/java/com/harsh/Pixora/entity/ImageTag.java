package com.harsh.Pixora.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "image_tag")
@Data
public class ImageTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tag")
    private String tag;

    @ManyToOne
    @JoinColumn(name = "info_id")
    @JsonBackReference
    private ImageInfo imageInfo;
}
