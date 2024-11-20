package com.fixspeech.spring_server.domain.youtube.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixspeech.spring_server.domain.record.service.UserVoiceService;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.UserService;
import com.fixspeech.spring_server.domain.youtube.model.YoutubeSearchResult;
import com.fixspeech.spring_server.domain.youtube.service.YoutubeService;
import com.fixspeech.spring_server.global.common.ApiResponse;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/youtube")
public class YoutubeController implements YoutubeApi {
	private final YoutubeService youtubeService;
	private final UserVoiceService userVoiceService;
	private final UserService userService;

	//최근 부족한 값에 대해 youtube_search_result에서 불러오기
	@GetMapping
	public ApiResponse<?> recommendLecture(
		@AuthenticationPrincipal UserDetails userDetails
	) {
		Users users = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		List<YoutubeSearchResult> result = youtubeService.getLecture(users);

		return ApiResponse.createSuccess(result, "유튜브 불러오기 성공");
	}

}