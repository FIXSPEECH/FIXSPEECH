package com.fixspeech.spring_server.domain.user.service;

import com.fixspeech.spring_server.domain.user.dto.response.ResponseRefreshTokenDTO;
import com.fixspeech.spring_server.domain.user.model.JwtUserClaims;
import com.fixspeech.spring_server.domain.user.model.Users;

public interface TokenService {
	String generateAccessToken(JwtUserClaims jwtUserClaims);

	String generateRefreshToken(JwtUserClaims jwtUserClaims);

	ResponseRefreshTokenDTO reissueOAuthToken(String refreshToken);
}
