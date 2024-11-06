package com.fixspeech.spring_server.domain.youtube.controller;

import java.io.IOException;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fixspeech.spring_server.domain.youtube.service.YoutubeService;
import com.fixspeech.spring_server.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/youtube")
public class YoutubeController implements YoutubeApi {

	private final YoutubeService youtubeService;

	@GetMapping
	public ApiResponse<String> searchVideo(@RequestParam String keyword) throws IOException {
		// YoutubeService를 통해 동영상 검색한 결과를 받아옴
		String result = youtubeService.searchVideo(keyword);
		return ApiResponse.createSuccess(result, "유튜브 불러오기 성공");

	}
}