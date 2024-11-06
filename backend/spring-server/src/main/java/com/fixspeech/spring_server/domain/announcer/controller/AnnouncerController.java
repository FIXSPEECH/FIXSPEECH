package com.fixspeech.spring_server.domain.announcer.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixspeech.spring_server.domain.announcer.dto.AnnouncerResponseDto;
import com.fixspeech.spring_server.domain.announcer.dto.response.UserAnnouncerVoiceComparisonResultDto;
import com.fixspeech.spring_server.domain.announcer.service.AnnouncerService;
import com.fixspeech.spring_server.global.common.ApiResponse;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("announcer")
@RequiredArgsConstructor
public class AnnouncerController {

	private final AnnouncerService announcerService;

	@GetMapping
	public ApiResponse<?> getAllAnnouncerData() {
		try {
			List<AnnouncerResponseDto> announcerResponseDtos = announcerService.getAllAnnouncerData();
			return ApiResponse.createSuccess(announcerResponseDtos, "모든 아나운서 데이터 출력");
		} catch (Exception e) {
			return ApiResponse.createError(ErrorCode.BAD_REQUEST_ERROR);
		}
	}

	@GetMapping("compare/{id}")
	public ApiResponse<?> getOneUserToAnnouncerVoiceComparison(@PathVariable Long id) {
		UserAnnouncerVoiceComparisonResultDto userAnnouncerVoiceComparisonResultDto = announcerService.getOneUserToAnnouncerVoiceComparison(id);
		return ApiResponse.createSuccess(userAnnouncerVoiceComparisonResultDto,"사용자와 아나운서 음성 비교 데이터 출력 성공");
	}
}
