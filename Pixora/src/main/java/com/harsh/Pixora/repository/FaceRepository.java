package com.harsh.Pixora.repository;

import com.harsh.Pixora.entity.Face;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FaceRepository extends JpaRepository<Face,Long> {
    @Query(value = "SELECT * FROM face WHERE face_image_path = :faceImagePath LIMIT 1", nativeQuery = true)
    Optional<Face> findByFaceImagePath(@Param("faceImagePath") String faceImagePath);

    @Modifying
    @Transactional
    @Query(value = """
UPDATE face 
SET person_name = :name 
WHERE id = :id
""", nativeQuery = true)
    void updatePersonNameById(
            @Param("id") Long id,
            @Param("name") String name
    );
}
