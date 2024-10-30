package com.fixspeech.spring_server.oauth.repository;

import org.springframework.data.repository.CrudRepository;

import com.fixspeech.spring_server.oauth.model.OAuthCodeToken;

public interface OAuthCodeTokenRepository extends CrudRepository<OAuthCodeToken, String> {
}