package com.fixspeech.spring_server.domain.announcer.controller;

import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSample;
import lombok.ToString;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fixspeech.spring_server.domain.announcer.dto.response.AnnouncerVoiceSampleResponseDto;
import com.fixspeech.spring_server.domain.announcer.dto.response.UserAnnouncerVoiceComparisonResultDto;
import com.fixspeech.spring_server.domain.announcer.service.AnnouncerService;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.UserService;
import com.fixspeech.spring_server.global.common.ApiResponse;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("announcer")
@RequiredArgsConstructor
public class AnnouncerController {

	private final UserService userService;
	private final AnnouncerService announcerService;

	@GetMapping("test")
	public ApiResponse<?> getTest() {
		return ApiResponse.createSuccess(announcerService.getAllAnnouncerData(), "테스트 확인");
	}

	/**
	 * 아나운서 음성 데이터 전체 조회
	 * @return announcerResponseDtos
	 */
	@GetMapping
	public ApiResponse<?> getAllAnnouncerData(@RequestParam(required = false, defaultValue = "0", value = "page") int pageNo,
		@RequestParam(required = false, defaultValue = "createdAt", value = "criteria") String criteria) {
		try {
			log.info("test");
//			Page<AnnouncerVoiceSample> announcerResponse = announcerService.getAllAnnouncerData(pageNo, criteria);
			List<AnnouncerVoiceSampleResponseDto> announcerResponse = announcerService.getAllAnnouncerData();
			log.info("announcerResponseDtos: {}",announcerResponse);
			return ApiResponse.createSuccess(announcerResponse, "모든 아나운서 데이터 출력");
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

	/**
	 * 사용자가 녹음한 아나운서 음성 분석 결과 전체 조회
	 * @param pageNo 현재 페이지
	 * @param criteria 정렬 기준
	 * @param userDetails
	 * @return
	 */
	@GetMapping("/compare/all")
	public ApiResponse<?> getAllUserToAnnouncerVoiceComparison(@RequestParam(required = false, defaultValue = "0", value = "page") int pageNo,
		@RequestParam(required = false, defaultValue = "createdAt", value = "criteria") String criteria,
		@AuthenticationPrincipal UserDetails userDetails) {
		String email = userDetails.getUsername();

		Users user = userService.findByEmail(email)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		
		return ApiResponse.createSuccess(announcerService.getAllUserToAnnouncerVoiceComparison(pageNo, criteria, user.getId()), "사용자와 아나운서 음성 비교 데이터 페이지 출력 성공");
	}
}
