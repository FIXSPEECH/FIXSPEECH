package com.fixspeech.spring_server.domain.announcer.service;

import org.springframework.data.domain.Page;

import com.fixspeech.spring_server.domain.announcer.dto.request.CompareResultRequestDto;
import com.fixspeech.spring_server.domain.announcer.dto.response.SmallAnnouncerVoiceSampleResponseDto;
import com.fixspeech.spring_server.domain.announcer.dto.response.UserAnnouncerVoiceComparisonResponseDto;

public interface AnnouncerService {

	SmallAnnouncerVoiceSampleResponseDto getOneAnnouncerData(String gender);

	// 아나운서 음성 데이터 전체 조회
	Page<SmallAnnouncerVoiceSampleResponseDto> getAllAnnouncerData(int pageNo, String criteria);

	// 사용자가 녹음한 아나운서 음성 분석 결과 전체 조회
	Page<UserAnnouncerVoiceComparisonResponseDto> getAllUserToAnnouncerVoiceComparison(int pageNo, String criteria, Long userId);

	// 사용자가 녹음한 아나운서 음성 분석 결과 단일 조회
	UserAnnouncerVoiceComparisonResponseDto getOneUserToAnnouncerVoiceComparison(Long id);

	// 유저 음성 녹음
	Long saveComparisonResult(CompareResultRequestDto compareResultRequestDto, String recordAddress, Long userId);
	
	// 사용자 음성와 아나운서 음성 분석 결과 저장
}
