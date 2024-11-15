package com.fixspeech.spring_server.domain.oauth.repository;

import org.springframework.data.repository.CrudRepository;

import com.fixspeech.spring_server.domain.oauth.model.TempUser;

public interface TempUserRepository extends CrudRepository<TempUser, String> {
}