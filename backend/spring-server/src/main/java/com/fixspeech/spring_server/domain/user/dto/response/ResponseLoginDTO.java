package com.fixspeech.spring_server.domain.user.dto.response;

import com.fixspeech.spring_server.domain.user.model.Users;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ResponseLoginDTO {

	private Long userId;
	private String email;
	private String nickname;
	private String profileImage;

	public static ResponseLoginDTO fromEntity(Users user) {
		String imageUrl = user.getImage();
		System.out.println(user.getId() + " " + user.getEmail() + " " + user.getNickName());
		return ResponseLoginDTO.builder()
			.userId(user.getId())
			.email(user.getEmail())
			.nickname(user.getNickName())
			.profileImage(imageUrl)
			.build();
	}
}