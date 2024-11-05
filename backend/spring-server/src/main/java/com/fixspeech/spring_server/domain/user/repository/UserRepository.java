package com.fixspeech.spring_server.domain.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.user.model.Users;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
	Optional<Users> findByEmail(String email);

	@Query("SELECT u FROM Users u WHERE u.email = :email")
	Optional<Users> findGrassByEmail(@Param("email") String email);
}
