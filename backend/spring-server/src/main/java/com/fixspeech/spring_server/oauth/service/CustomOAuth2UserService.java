package com.fixspeech.spring_server.oauth.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.user.model.JwtUserClaims;
import com.fixspeech.spring_server.domain.user.model.Role;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.repository.UserRepository;
import com.fixspeech.spring_server.global.common.JwtTokenProvider;
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
		OAuth2User oAuth2User = super.loadUser(userRequest);
		return saveOrUpdate(userRequest, oAuth2User);
	}

	private OAuth2User saveOrUpdate(OAuth2UserRequest userRequest ,OAuth2User oAuth2User) {
		String registrationId = userRequest.getClientRegistration().getRegistrationId();
		String userNameAttributeName = userRequest.getClientRegistration()
			.getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

		OAuthAttributes attributes = OAuthAttributes.of(registrationId, userNameAttributeName,
			oAuth2User.getAttributes());
		
		// 사용자 정보 불러오기
		Users user = userRepository.findByEmail(attributes.getEmail())
			.map(entity -> entity.updateOAuthInfo(
				registrationId,
				attributes.getProviderId(),
				attributes.getImage())
			)
			// 정보가 없다면 새 정보를 생성
			.orElse(
				Users.builder()
					.email(attributes.getEmail())
					.name(attributes.getName())
					.nickName(attributes.getNickName())
					.age(attributes.getAge())
					.isActive(true)
					.gender(attributes.getGender())
					.image(attributes.getImage())
					.provider(registrationId)
					.providerId(attributes.getProviderId())
					.role(Role.ROLE_USER)
				.build()
		);

		// 정보 저장 혹은 변경
		userRepository.save(user);
		
		// 토큰 발급
		JwtUserClaims jwtUserClaims = JwtUserClaims.fromUsersEntity(user);
		String refreshToken = jwtTokenProvider.generateRefreshToken(jwtUserClaims);
		Map<String, Object> tempAttributes = new HashMap<>();
		tempAttributes.put("tempToken", refreshToken);

		return new DefaultOAuth2User(
			Collections.singleton(new SimpleGrantedAuthority(user.getRole().name())),
			attributes.getAttributes(),
			attributes.getNameAttributeKey());
	}
}
