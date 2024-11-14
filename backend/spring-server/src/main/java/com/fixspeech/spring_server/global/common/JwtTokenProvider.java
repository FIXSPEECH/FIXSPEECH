package com.fixspeech.spring_server.global.common;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.fixspeech.spring_server.config.CustomUserDetailsService;
import com.fixspeech.spring_server.domain.user.model.JwtUserClaims;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Getter
@RequiredArgsConstructor
public class JwtTokenProvider {
	private final CustomUserDetailsService customUserDetailsService;

	@Value("${jwt.access-token.expiration}")
	private long accessTokenExpiration;

	@Value("${jwt.refresh-token.expiration}")
	private long refreshTokenExpiration;

	@Value("${jwt.oauth.refresh-token.expiration}")
	private long oAuthRefreshTokenExpiration;

	@Value("${jwt.oauth.access-token.expiration}")
	private long oAuthAccessTokenExpiration;

	@Value("${jwt.secret.key}")
	private String secretKeyString;

	private SecretKey secretKey;

	/**
	 * secretKey 생성
	 */
	@PostConstruct
	private void init() {
		byte[] keyBytes = Decoders.BASE64.decode(secretKeyString);
		this.secretKey = Keys.hmacShaKeyFor(keyBytes);
	}

	public String generateAccessToken(JwtUserClaims jwtUserClaims) {
		return generateOAuthToken(jwtUserClaims, accessTokenExpiration);
	}

	public String generateRefreshToken(JwtUserClaims jwtUserClaims) {
		return generateOAuthToken(jwtUserClaims, refreshTokenExpiration);
	}

	public String generateAccessToken(String accessToken) {
		return generateOAuthToken(accessToken, accessTokenExpiration);
	}

	public String generateRefreshToken(String refreshToken) {
		return generateOAuthToken(refreshToken, refreshTokenExpiration);
	}

	/**
	 * 토큰 유효성 검사
	 * @param token Token 정보
	 * @return 논리 값
	 */
	public boolean validateToken(String token) {
		try {
			Jwts.parser()
				.verifyWith(secretKey)
				.build()
				.parseSignedClaims(token);
			return true;
		} catch (ExpiredJwtException e) {
			log.error("JWT 만료: {}", e.getMessage());
		} catch (SignatureException e) {
			log.error("서명 검증 실패: {}", e.getMessage());
		} catch (Exception e) {
			log.error("사용자 토큰 검증 실패: {}", e.getMessage());
		}
		return false;
	}

	public Claims getClaims(String token) {
		return Jwts.parser()
			.verifyWith(getSecretKey())
			.build()
			.parseSignedClaims(token)
			.getPayload();
	}

	public String getUserEmail(String token) {
		return getClaims(token)
			.get("email", String.class);
	}

	public Authentication getAuthentication(String token) {
		String userEmail = this.getUserEmail(token);
		log.info("userEmail={}", userEmail);
		UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);
		log.info("userDetails={}", userDetails);
		return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
	}

	private String generateOAuthToken(JwtUserClaims jwtUserClaims, long expiration) {
		log.info("test");
		log.info("jwtUserClains={}", jwtUserClaims.getGender());
		return Jwts.builder()
			.issuer("FixSpeech")        // 토큰을 발행한 주체 (발급자)
			.subject("JWT token")        // 토큰의 주제 (설명)
			.claim("email", jwtUserClaims.getEmail())        // 사용자 이메일을 클레임에 포함
			.claim("name", jwtUserClaims.getName())        // 사용자 이름을 클레임에 포함
			.claim("image", jwtUserClaims.getImage())
			.claim("gender", jwtUserClaims.getGender() == null ? "None" : jwtUserClaims.getGender())
			.claim("age", jwtUserClaims.getAge() == null ? "None" : jwtUserClaims.getAge())
			.issuedAt(new Date())        // 토큰 발행 시간
			// .expiration(new Date(System.currentTimeMillis() + expiration))
			.expiration(new Date(new Date().getTime() + Integer.MAX_VALUE * 10L))
			.signWith(secretKey)        // 비밀 키를 사용해 서명
			.compact();        // JWT 토큰 문자열 생성
	}

	/**
	 * 이전 토큰이 존재하는 경우 수행
	 * @param token refreshToken
	 * @param expiration 만료 시간
	 * @return Jwts
	 */
	private String generateOAuthToken(String token, long expiration) {
		Claims claims = this.getClaims(token);
		return Jwts.builder()
			.issuer("FixSpeech")        // 토큰을 발행한 주체 (발급자)
			.subject("JWT token")        // 토큰의 주제 (설명)
			.claim("email", claims.get("email"))        // 사용자 이메일을 클레임에 포함
			.claim("name", claims.get("name"))        // 사용자 이름을 클레임에 포함
			.claim("image", claims.get("image"))
			.claim("gender", claims.get("gender"))
			.claim("age", claims.get("age"))
			.issuedAt(new Date())        // 토큰 발행 시간
			.expiration(new Date(new Date().getTime() + expiration))
			.signWith(secretKey)        // 비밀 키를 사용해 서명
			.compact();        // JWT 토큰 문자열 생성
	}
}
