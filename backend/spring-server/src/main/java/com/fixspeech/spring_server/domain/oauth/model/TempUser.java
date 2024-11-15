package com.fixspeech.spring_server.domain.oauth.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@RedisHash(value = "tempUser", timeToLive = 1800)
public class TempUser {
	@Id
	private String token;
	private String email;
	private String name;
	private String provider;
	private String providerId;
}
