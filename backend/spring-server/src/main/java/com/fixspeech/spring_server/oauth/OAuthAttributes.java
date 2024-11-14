package com.fixspeech.spring_server.oauth;

import java.util.Map;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Getter
@Builder
@Slf4j
public class OAuthAttributes {
	private Map<String, Object> attributes;
	private String nameAttributeKey;
	private String name;
	private String email;
	private String image;
	private String providerId;
	private Integer age;
	private String gender;
	private String nickName;

	public static OAuthAttributes of(String registrationId, String userNameAttributeName,
		Map<String, Object> attributes) {
		if (registrationId.equals("kakao")) {
			return ofKakao(userNameAttributeName, attributes);
		}
		return null;
	}

	private static OAuthAttributes ofKakao(String userNameAttributeName, Map<String, Object> attributes) {
		Map<String, Object> kakaoAccount = (Map<String, Object>)attributes.get("kakao_account");
		log.info("kakaoAccount = {}", kakaoAccount);
		Map<String, Object> kakaoProfile = (Map<String, Object>)kakaoAccount.get("profile");
		log.info("kakaoProfile = {}", kakaoProfile);
		log.info("attributes = {}", attributes);
		return OAuthAttributes.builder()
			.name((String)kakaoAccount.get("name"))
			.email((String)kakaoAccount.get("email"))
			.nickName((String)kakaoProfile.get("nickname"))
			.image((String)kakaoProfile.get("profile_image_url"))
			// .age(Integer.parseInt(((String)kakaoAccount.get("age_range")).split("~")[0]))
			// .gender((String)kakaoAccount.get("gender"))
			.providerId(String.valueOf(attributes.get("id")))
			.attributes(attributes)
			.nameAttributeKey(userNameAttributeName)
			.build();
	}
}
