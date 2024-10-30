package com.fixspeech.spring_server.domain.user.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SimilarDTO {
	private Long commonFollowsCount;
	private String userNickName;
	private String userProfileUrl;
	private Long userId;
}
