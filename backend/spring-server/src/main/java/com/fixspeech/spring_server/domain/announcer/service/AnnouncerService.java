package com.fixspeech.spring_server.domain.announcer.service;

import java.util.List;

import com.fixspeech.spring_server.domain.announcer.dto.AnnouncerResponseDto;
import com.fixspeech.spring_server.domain.announcer.dto.response.UserAnnouncerVoiceComparisonResultDto;

public interface AnnouncerService {

	// 아나운서 음성 데이터 전체 조회
	List<AnnouncerResponseDto> getAllAnnouncerData();

	// 사용자가 녹음한 아나운서 음성 분석 결과 전체 조히

	// 사용자가 녹음한 아나운서 음성 분석 결과 단일 조회
	UserAnnouncerVoiceComparisonResultDto getOneUserToAnnouncerVoiceComparison(Long id);

	// 유저 음성 녹음
	
	// 사용자 음성와 아나운서 음성 분석 결과 저장
}
