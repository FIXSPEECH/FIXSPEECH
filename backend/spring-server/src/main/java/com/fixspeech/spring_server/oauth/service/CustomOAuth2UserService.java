package com.fixspeech.spring_server.oauth.service;

import java.util.Collections;
import java.util.Date;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.common.JwtTokenProvider;
import com.fixspeech.spring_server.domain.user.model.Role;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.repository.UserRepository;
import com.fixspeech.spring_server.oauth.OAuthAttributes;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

	private final UserRepository userRepository;
	private final JwtTokenProvider jwtTokenProvider;

	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
		log.info("userRequest: {}", userRequest);
		OAuth2User oAuth2User = super.loadUser(userRequest);

		// kakao, naver OAuth2 로그인을 구분하기 위한 key
		String registrationId = userRequest.getClientRegistration().getRegistrationId();
		// OAuth 로그인 시 Key가 되는 PK값
		// kakao : id, naver : response
		String userNameAttributeName = userRequest.getClientRegistration()
			.getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
		OAuthAttributes attributes = OAuthAttributes.of(registrationId, userNameAttributeName,
			oAuth2User.getAttributes());
		log.info("registrationId={}", registrationId);
		Users user = userRepository.findByEmail(attributes.getEmail()).orElse(null);

		if (user == null) {
			user = Users.builder()
				.email(attributes.getEmail())
				.name(attributes.getName())
				.nickName(attributes.getNickName())
				.age(attributes.getAge())
				.isActive(true)
				.password("")
				.createdAt(new Date())
				.gender(attributes.getGender())
				.provider(registrationId)
				.providerId(attributes.getProviderId())
				.role(Role.ROLE_USER)
				.build();

			user = userRepository.save(user);

			// 이메일 이름으로 JWT 토큰 생성
			String accessToken = jwtTokenProvider.generateAccessToken(attributes.getEmail(), attributes.getName());
			String refreshToken = jwtTokenProvider.generateRefreshToken(attributes.getEmail(),
				attributes.getName());

		} else if (!registrationId.equals(user.getProvider()) || !attributes.getProviderId()
			.equals(user.getProviderId())) {
			user.updateOAuthInfo(attributes.getProviderId(), registrationId);
			user = userRepository.save(user);
		}
		log.info("getNameAttributeKey={}", attributes.getNameAttributeKey());
		return new DefaultOAuth2User(
			Collections.singleton(new SimpleGrantedAuthority(user.getRole().name())),
			attributes.getAttributes(),
			attributes.getNameAttributeKey());
	}
}
