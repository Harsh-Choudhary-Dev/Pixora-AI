package com.harsh.Pixora.entity;

import lombok.Data;

@Data
public class ImageListDTO {

    private Long id;
    private String image;

    public ImageListDTO(Long id, String image) {
        this.id = id;
        this.image = image;
    }
}
