package com.fixspeech.spring_server.domain.announcer.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.announcer.dto.AnnouncerResponseDto;
import com.fixspeech.spring_server.domain.announcer.dto.response.UserAnnouncerVoiceComparisonResultDto;
import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSample;
import com.fixspeech.spring_server.domain.announcer.model.UserAnnouncerVoiceComparisonResult;
import com.fixspeech.spring_server.domain.announcer.repository.AnnouncerRepository;
import com.fixspeech.spring_server.domain.announcer.repository.UserAnnouncerVoiceComparisonRepository;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnnouncerServiceImpl implements AnnouncerService {

	private final AnnouncerRepository announcerRepository;
	private final UserAnnouncerVoiceComparisonRepository userAnnouncerVoiceComparisonRepository;
	/**
	 * 모든 아나운서 샘플 조회
	 * @return List<AnnouncerResponseDto>
	 */
	@Override
	public List<AnnouncerResponseDto> getAllAnnouncerData() {
		List<AnnouncerVoiceSample> announcers = announcerRepository.findAll();
		log.info("모든 아나운서 정보 길이= {}", announcers.size());
		return AnnouncerResponseDto.from(announcers);
	}

	@Override
	public UserAnnouncerVoiceComparisonResultDto getOneUserToAnnouncerVoiceComparison(Long id) {
		UserAnnouncerVoiceComparisonResult userAnnouncerVoiceComparisonResult = userAnnouncerVoiceComparisonRepository.findById(id)
			.orElseThrow(() -> new CustomException(ErrorCode.BAD_REQUEST_ERROR));
		log.info("사용자와 아나운서 음성 비교 상세 조회= {}", userAnnouncerVoiceComparisonResult);
		return UserAnnouncerVoiceComparisonResultDto.from(userAnnouncerVoiceComparisonResult);
	}
}
