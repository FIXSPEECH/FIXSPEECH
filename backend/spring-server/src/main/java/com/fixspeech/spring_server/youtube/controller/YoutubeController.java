package com.fixspeech.spring_server.youtube.controller;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fixspeech.spring_server.youtube.service.YoutubeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/youtube")
public class YoutubeController {

	private final YoutubeService youtubeService;

	@GetMapping
	public ResponseEntity<String> searchVideo(@RequestParam String keyword) throws IOException {
		// YoutubeService를 통해 동영상 검색한 결과를 받아옴
		String result = youtubeService.searchVideo(keyword);
		return ResponseEntity.ok(result);

	}
}