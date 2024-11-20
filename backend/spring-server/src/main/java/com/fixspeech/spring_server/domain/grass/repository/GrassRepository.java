package com.fixspeech.spring_server.domain.grass.repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.grass.model.Grass;

@Repository
public interface GrassRepository extends JpaRepository<Grass, Long> {
	@Query("SELECT g FROM Grass g WHERE g.userId = :userId")
	Optional<List<Grass>> findUserGrassByUserId(@Param("userId") Long userId);

	@Query(value = "SELECT now()", nativeQuery = true)
	Date getCurrentDate();

	@Query("SELECT g FROM Grass g WHERE g.userId = :userId AND FUNCTION('DATE_FORMAT', g.createdAt, '%Y-%m-%d') = CURRENT_DATE")
	Optional<Grass> findGrassRecordExists(@Param("userId") Long userId);
}
