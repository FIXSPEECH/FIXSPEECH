package com.fixspeech.spring_server.domain.user.repository.redis;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.user.model.RefreshToken;

@Repository
public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {
	List<RefreshToken> findAllByUserEmail(String userEmail);
}
