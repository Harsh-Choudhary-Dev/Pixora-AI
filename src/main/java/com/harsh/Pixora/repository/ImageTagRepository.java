package com.harsh.Pixora.repository;

import com.harsh.Pixora.entity.ImageTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageTagRepository extends JpaRepository<ImageTag,Long> {
}
