package com.fixspeech.spring_server.domain.announcer.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.config.s3.S3Service;
import com.fixspeech.spring_server.domain.announcer.dto.request.CompareResultRequestDto;
import com.fixspeech.spring_server.domain.announcer.dto.response.UserAnnouncerVoiceComparisonResponseDto;
import com.fixspeech.spring_server.domain.announcer.service.AnnouncerService;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.UserService;
import com.fixspeech.spring_server.global.common.ApiResponse;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("announcer")
@RequiredArgsConstructor
public class AnnouncerController implements AnnouncerApi {

	private final UserService userService;
	private final AnnouncerService announcerService;
	private final S3Service s3Service;

	/**
	 * 사용자의 성별에 따른 하나의 랜덤한 아나운서 텍스트 데이터 조회
	 * @param userDetails 사용자 정보
	 * @return 아나운서 텍스트 데이터
	 */
	@GetMapping("one")
	public ApiResponse<?> getOneAnnouncerData(@AuthenticationPrincipal UserDetails userDetails) {
		Users user = userService.findByEmail(userDetails.getUsername()).orElse(null);
		if (user == null) {
			return ApiResponse.createError(ErrorCode.USER_NOT_FOUND);
		}
		return ApiResponse.createSuccess(announcerService.getOneAnnouncerData(user.getGender()), "아나운서 데이터 단일 조회 성공");
	}

	/**
	 * 아나운서 음성 데이터 전체 조회
	 *
	 * @param pageNo   현재 페이지
	 * @param criteria 정렬 기준
	 * @return SmallAnnouncerVoiceSampleResponseDto
	 */
	@GetMapping("all")
	public ApiResponse<?> getAllAnnouncerData(
		@RequestParam(required = false, defaultValue = "0", value = "page") int pageNo,
		@RequestParam(required = false, defaultValue = "createdAt", value = "criteria") String criteria) {
		try {
			return ApiResponse.createSuccess(announcerService.getAllAnnouncerData(pageNo, criteria), "모든 아나운서 데이터 출력");
		} catch (Exception e) {
			return ApiResponse.createError(ErrorCode.BAD_REQUEST_ERROR);
		}
	}

	/**
	 * 아나운서 따라잡기 사용자 음성 저장
	 * @param userDetails 사용자 정보
	 * @param file 사용자 음성 파일
	 * @param compareResultRequestDto 비교 결과
	 * @return 저장된 정보의 PK
	 */
	@PostMapping("compare/record")
	public ApiResponse<?> saveComparisonResult(@AuthenticationPrincipal UserDetails userDetails,
		@RequestPart(value = "record", required = false) MultipartFile file,
		@RequestPart(value = "data") CompareResultRequestDto compareResultRequestDto) {
		try {
			Users users = userService.findByEmail(userDetails.getUsername())
				.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
			String recordAddress = s3Service.upload(file, "compare");
			Long compareId = announcerService.saveComparisonResult(compareResultRequestDto, recordAddress,
				users.getId());
			return ApiResponse.createSuccess(compareId, "비교 결과 저장 완료");
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_UPLOAD_RECORD);
		}
	}

	/**
	 * 사용자가 녹음한 아나운서 음성 분석 결과 단일 조회
	 * @param id 상세 조회 id
	 * @return userAnnouncerVoiceComparisonResult - 음성 분석 비교 결과
	 */
	@GetMapping("compare/{id}")
	public ApiResponse<?> getOneUserToAnnouncerVoiceComparison(@PathVariable Long id) {
		UserAnnouncerVoiceComparisonResponseDto userAnnouncerVoiceComparisonResultDto = announcerService.getOneUserToAnnouncerVoiceComparison(
			id);
		return ApiResponse.createSuccess(userAnnouncerVoiceComparisonResultDto, "사용자와 아나운서 음성 비교 데이터 출력 성공");
	}

	/**
	 * 사용자가 녹음한 아나운서 음성 분석 결과 전체 조회
	 * @param pageNo 현재 페이지
	 * @param criteria 정렬 기준
	 * @param userDetails 사용자 정보
	 * @return Page<UserAnnouncerVoiceComparisonResponseDto>
	 */
	@GetMapping("/compare/all")
	public ApiResponse<?> getAllUserToAnnouncerVoiceComparison(
		@RequestParam(required = false, defaultValue = "0", value = "page") int pageNo,
		@RequestParam(required = false, defaultValue = "createdAt", value = "criteria") String criteria,
		@AuthenticationPrincipal UserDetails userDetails) {
		String email = userDetails.getUsername();

		Users user = userService.findByEmail(email)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		return ApiResponse.createSuccess(
			announcerService.getAllUserToAnnouncerVoiceComparison(pageNo, criteria, user.getId()),
			"사용자와 아나운서 음성 비교 데이터 페이지 출력 성공");
	}
}
