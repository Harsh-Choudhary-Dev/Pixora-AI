package com.harsh.Pixora.repository;

import com.harsh.Pixora.entity.ImageFace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageFaceRepository extends JpaRepository<ImageFace,Long> {
}
