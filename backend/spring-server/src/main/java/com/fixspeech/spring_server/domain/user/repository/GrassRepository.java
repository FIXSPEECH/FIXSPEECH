package com.fixspeech.spring_server.domain.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.user.model.Grass;

@Repository
public interface GrassRepository extends JpaRepository<Grass, Long> {
	@Query("SELECT g FROM Grass g WHERE g.userId = :userId")
	Optional<List<Grass>> findUserGrassByUserId(@Param("userId") Long userId);
}
