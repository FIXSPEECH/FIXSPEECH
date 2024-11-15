package com.fixspeech.spring_server.domain.oauth.repository;

import org.springframework.data.repository.CrudRepository;

import com.fixspeech.spring_server.domain.oauth.model.OAuthCodeToken;

public interface OAuthCodeTokenRepository extends CrudRepository<OAuthCodeToken, String> {
}