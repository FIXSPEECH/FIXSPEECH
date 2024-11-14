package com.fixspeech.spring_server.domain.user.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JwtUserClaims {
	private String name; // Email
	private String nickName;
	private String email;
	private String gender;
	private Integer age;
	private String image;

	public static JwtUserClaims fromUsersEntity(Users users) {
		return JwtUserClaims.builder()
			.name(users.getName())
			.nickName(users.getNickName())
			.email(users.getEmail())
			.gender(users.getGender())
			.age(users.getAge())
			.image(users.getImage())
			.build();
	}
}
