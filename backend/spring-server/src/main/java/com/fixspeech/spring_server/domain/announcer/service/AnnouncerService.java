package com.fixspeech.spring_server.domain.announcer.service;

import java.util.List;

import com.fixspeech.spring_server.domain.announcer.dto.response.AnnouncerVoiceSampleResponseDto;
import org.springframework.data.domain.Page;

import com.fixspeech.spring_server.domain.announcer.dto.response.UserAnnouncerVoiceComparisonResultDto;
import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSample;
import com.fixspeech.spring_server.domain.announcer.model.UserAnnouncerVoiceComparisonResult;

public interface AnnouncerService {

	List<AnnouncerVoiceSampleResponseDto> getAllAnnouncerData();

	// 아나운서 음성 데이터 전체 조회
	Page<AnnouncerVoiceSample> getAllAnnouncerData(int pageNo, String criteria);

	// 사용자가 녹음한 아나운서 음성 분석 결과 전체 조회
	Page<UserAnnouncerVoiceComparisonResult> getAllUserToAnnouncerVoiceComparison(int pageNo, String criteria, Long userId);

	// 사용자가 녹음한 아나운서 음성 분석 결과 단일 조회
	UserAnnouncerVoiceComparisonResultDto getOneUserToAnnouncerVoiceComparison(Long id);

	// 유저 음성 녹음
	
	// 사용자 음성와 아나운서 음성 분석 결과 저장
}
