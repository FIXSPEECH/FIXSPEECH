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

	/**
	 * 아나운서 음성 데이터 전체 조회
	 * @return announcerResponseDtos
	 */
	@GetMapping
	public ApiResponse<?> getAllAnnouncerData() {
		try {
			List<AnnouncerResponseDto> announcerResponseDtos = announcerService.getAllAnnouncerData();
			return ApiResponse.createSuccess(announcerResponseDtos, "모든 아나운서 데이터 출력");
		} catch (Exception e) {
			return ApiResponse.createError(ErrorCode.BAD_REQUEST_ERROR);
		}
	}

	/**
	 * 사용자가 녹음한 아나운서 음성 분석 결과 단일 조회
	 * @param id 상세 조회 id
	 * @return userAnnouncerVoiceComparisonResult - 음성 분석 비교 결과
	 */
	@GetMapping("compare/{id}")
	public ApiResponse<?> getOneUserToAnnouncerVoiceComparison(@PathVariable Long id) {
		UserAnnouncerVoiceComparisonResultDto userAnnouncerVoiceComparisonResultDto = announcerService.getOneUserToAnnouncerVoiceComparison(id);
		return ApiResponse.createSuccess(userAnnouncerVoiceComparisonResultDto,"사용자와 아나운서 음성 비교 데이터 출력 성공");
	}
}
