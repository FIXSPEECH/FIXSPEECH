package com.fixspeech.spring_server.domain.user.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@RedisHash(value = "tokenBlacklist", timeToLive = 604800) // 7일
public class TokenBlacklist {
	@Id
	private String token;
}