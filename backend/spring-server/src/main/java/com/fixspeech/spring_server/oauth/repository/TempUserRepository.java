package com.fixspeech.spring_server.oauth.repository;

import org.springframework.data.repository.CrudRepository;

import com.fixspeech.spring_server.oauth.model.TempUser;

public interface TempUserRepository extends CrudRepository<TempUser, String> {
}