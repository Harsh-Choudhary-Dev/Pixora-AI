package com.harsh.Pixora.repository;


import com.harsh.Pixora.entity.ImageInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageInfoRepository extends JpaRepository<ImageInfo,Long> {
    @Query(value = """
SELECT DISTINCT i.id, i.original_image
FROM image_face imf
JOIN image_info i ON imf.image_id = i.id
WHERE imf.face_id = :faceId
""", nativeQuery = true)
    List<Object[]> findImagesByFaceId(@Param("faceId") Long faceId);

    @Query(value = """
SELECT DISTINCT i.id, i.original_image
FROM image_tag t
JOIN image_info i ON t.info_id = i.id
WHERE t.tag = :tag
""", nativeQuery = true)
    List<Object[]> findImagesByTag(@Param("tag") String tag);

    @Query(value = """
SELECT i.id, i.original_image
FROM image_info i
ORDER BY i.id DESC
""",
            countQuery = "SELECT COUNT(*) FROM image_info",
            nativeQuery = true)
    Page<Object[]> findAllImages(Pageable pageable);

    @Query(value = """
SELECT DISTINCT i.id, i.original_image
FROM image_face imf
JOIN image_info i ON imf.image_id = i.id
JOIN face f ON imf.face_id = f.id
WHERE f.person_name = :personName
""", nativeQuery = true)
    List<Object[]> findImagesByPersonName(@Param("personName") String personName);
}
