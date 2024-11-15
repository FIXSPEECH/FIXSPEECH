package com.fixspeech.spring_server.domain.user.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.user.dto.response.ResponseRefreshTokenDTO;
import com.fixspeech.spring_server.domain.user.model.JwtUserClaims;
import com.fixspeech.spring_server.domain.user.model.RefreshToken;
import com.fixspeech.spring_server.domain.user.model.TokenBlacklist;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.repository.redis.RefreshTokenRepository;
import com.fixspeech.spring_server.domain.user.repository.redis.TokenBlacklistRepository;
import com.fixspeech.spring_server.global.common.JwtTokenProvider;
import com.fixspeech.spring_server.domain.oauth.model.OAuthRefreshToken;
import com.fixspeech.spring_server.domain.oauth.repository.OAuthRefreshRepository;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

	private final JwtTokenProvider jwtTokenProvider;
	private final RefreshTokenRepository refreshTokenRepository;
	private final OAuthRefreshRepository oAuthRefreshRepository;
	private final TokenBlacklistRepository tokenBlacklistRepository;

	@Override
	public String generateAccessToken(JwtUserClaims jwtUserClaims) {
		return jwtTokenProvider.generateAccessToken(jwtUserClaims);
	}

	@Override
	public String generateRefreshToken(JwtUserClaims jwtUserClaims) {
		String email = jwtUserClaims.getEmail();
		log.info("email={}", email);
		String refreshToken = jwtTokenProvider.generateRefreshToken(jwtUserClaims);
		saveRefreshToken(jwtUserClaims, refreshToken);
		return refreshToken;
	}

	/**
	 * OAuth 토큰 재발급
	 * @param refreshToken
	 * @return
	 */
	@Override
	public ResponseRefreshTokenDTO reissueOAuthToken(Users user, String refreshToken) {
		if(isRefreshTokenBlacklisted(refreshToken)) {
			return null;
		}
		if (jwtTokenProvider.validateToken(refreshToken)) {
			Claims claims = jwtTokenProvider.getClaims(refreshToken);
			String email = claims.get("email", String.class);
			String name = claims.get("name", String.class);
			log.info("refreshToken.email={}", email);

			// refreshToken 들고 탐색 ->
			// 만료시 refreshTokenRepository의 db를 확인해 보고 현재 사용자의 이메일이 없으면 null
			OAuthRefreshToken storedRefreshToken = oAuthRefreshRepository.findById(email)
				.orElseThrow(() -> new IllegalArgumentException("Refresh Token not found"));
			log.info("storedRefreshToken={}", storedRefreshToken);
			if (jwtTokenProvider.validateToken(storedRefreshToken.getToken())) {
				log.info("delete Token by email");
				oAuthRefreshRepository.deleteById(email);

				// refreshToken 만료 시키기
				log.info("generate Token");
				String newAccessToken = jwtTokenProvider.generateAccessToken(JwtUserClaims.fromUsersEntity(user));
				String newRefreshToken = jwtTokenProvider.generateRefreshToken(JwtUserClaims.fromUsersEntity(user));
				OAuthRefreshToken newRt = new OAuthRefreshToken(email, newRefreshToken);
				// jwtTokenProvider.getRefreshTokenExpiration());
				oAuthRefreshRepository.save(newRt);
				return new ResponseRefreshTokenDTO(newAccessToken, newRefreshToken);
			}
		}
		return null;
	}

	@Override
	public void blacklistRefreshToken(String refreshToken) {
		tokenBlacklistRepository.save(new TokenBlacklist(refreshToken));
	}

	@Override
	public boolean isRefreshTokenBlacklisted(String refreshToken) {
		return tokenBlacklistRepository.existsById(refreshToken);
	}

	@Override
	public void invalidateAllUserTokens(String email) {
		List<RefreshToken> userTokens = refreshTokenRepository.findAllByUserEmail(email);
		for (RefreshToken token : userTokens) {
			blacklistRefreshToken(token.getToken());
			refreshTokenRepository.delete(token);
		}
	}

	private void saveRefreshToken(JwtUserClaims jwtUserClaims, String refreshToken) {
		long refreshTokenExpireTime = jwtTokenProvider.getOAuthRefreshTokenExpiration();
		RefreshToken rt = new RefreshToken(jwtUserClaims.getEmail(), refreshToken, refreshTokenExpireTime);
		refreshTokenRepository.save(rt);
	}
}
