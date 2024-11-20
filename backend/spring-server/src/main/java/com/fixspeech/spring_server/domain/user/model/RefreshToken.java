package com.fixspeech.spring_server.domain.user.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@RedisHash(value = "refreshToken", timeToLive = 604800)
public class RefreshToken {
	@Id
	private String email;
	private String token;
	private long expiration;

	public RefreshToken(String token) {
		this.token = token;
	}

	public RefreshToken update(String token) {
		this.token = token;
		return this;
	}
}
