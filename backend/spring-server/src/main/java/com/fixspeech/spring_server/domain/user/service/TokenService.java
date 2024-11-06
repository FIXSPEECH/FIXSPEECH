package com.fixspeech.spring_server.domain.user.service;

import com.fixspeech.spring_server.domain.user.dto.response.ResponseRefreshTokenDTO;
import com.fixspeech.spring_server.domain.user.model.JwtUserClaims;

public interface TokenService {
	String generateAccessToken(JwtUserClaims jwtUserClaims);

	String generateRefreshToken(JwtUserClaims jwtUserClaims);

	ResponseRefreshTokenDTO reissueOAuthToken(String refreshToken);

	void blacklistRefreshToken(String refreshToken);

	boolean isRefreshTokenBlacklisted(String refreshToken);

	void invalidateAllUserTokens(String email);
}
