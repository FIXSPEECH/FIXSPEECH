package com.fixspeech.spring_server.domain.announcer.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.announcer.dto.AnnouncerResponseDto;
import com.fixspeech.spring_server.domain.announcer.dto.response.UserAnnouncerVoiceComparisonResultDto;
import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSample;
import com.fixspeech.spring_server.domain.announcer.model.UserAnnouncerVoiceComparisonResult;
import com.fixspeech.spring_server.domain.announcer.repository.AnnouncerRepository;
import com.fixspeech.spring_server.domain.announcer.repository.UserAnnouncerVoiceComparisonRepository;

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

	/**
	 * 사용자가 녹음한 아나운서 음성 분석 결과 단일 조회
	 * @param id 상세 조회 id
	 * @return userAnnouncerVoiceComparisonResult - 음성 분석 비교 결과
	 */
	@Override
	public UserAnnouncerVoiceComparisonResultDto getOneUserToAnnouncerVoiceComparison(Long id) {
		UserAnnouncerVoiceComparisonResult userAnnouncerVoiceComparisonResult = userAnnouncerVoiceComparisonRepository.findById(id).orElse(null);
		log.info("사용자와 아나운서 음성 비교 상세 조회= {}", userAnnouncerVoiceComparisonResult);
		if (userAnnouncerVoiceComparisonResult == null) {
			return null;
		}
		return UserAnnouncerVoiceComparisonResultDto.from(userAnnouncerVoiceComparisonResult);
	}

	/**
	 * 사용자가 녹음한 아나운서 음성 분석 결과 전체 조회
	 * @param pageNo 현재 페이지
	 * @param criteria 정렬 기준
	 * @param userId 사용자 id
	 * @return Page<UserAnnouncerVoiceComparisonResult>
	 */
	@Override
	public Page<UserAnnouncerVoiceComparisonResult> getAllUserToAnnouncerVoiceComparison(int pageNo, String criteria, Long userId) {
		Pageable pageable = PageRequest.of(pageNo, 10, Sort.by(Sort.Direction.DESC, criteria));
		Page<UserAnnouncerVoiceComparisonResult> page = userAnnouncerVoiceComparisonRepository.findByUserId(pageable, userId);
		return page;
	}
}
