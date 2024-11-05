package com.fixspeech.spring_server.domain.user.repository.redis;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.user.model.TokenBlacklist;

@Repository
public interface TokenBlacklistRepository extends CrudRepository<TokenBlacklist, String> {
}

