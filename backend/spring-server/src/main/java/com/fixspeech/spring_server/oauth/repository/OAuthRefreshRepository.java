package com.fixspeech.spring_server.oauth.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.oauth.model.OAuthRefreshToken;

@Repository
public interface OAuthRefreshRepository extends CrudRepository<OAuthRefreshToken, String> {
	List<OAuthRefreshToken> findAllByEmail(String email);
}
