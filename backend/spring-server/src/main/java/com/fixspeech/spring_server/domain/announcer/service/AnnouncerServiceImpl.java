package com.fixspeech.spring_server.domain.announcer.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.announcer.dto.request.CompareResultRequestDto;
import com.fixspeech.spring_server.domain.announcer.dto.response.AnnouncerVoiceSampleResponseDto;
import com.fixspeech.spring_server.domain.announcer.dto.response.UserAnnouncerVoiceComparisonResponseDto;
import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSample;
import com.fixspeech.spring_server.domain.announcer.model.UserAnnouncerVoiceComparisonResult;
import com.fixspeech.spring_server.domain.announcer.repository.AnnouncerVoiceSampleRepository;
import com.fixspeech.spring_server.domain.announcer.repository.UserAnnouncerVoiceComparisonRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnnouncerServiceImpl implements AnnouncerService {

	private final AnnouncerVoiceSampleRepository announcerVoiceSampleRepository;
	private final UserAnnouncerVoiceComparisonRepository userAnnouncerVoiceComparisonRepository;

	@Override
	public List<AnnouncerVoiceSampleResponseDto> getAllAnnouncerData() {
		List<AnnouncerVoiceSample> announcerVoiceSamples = announcerVoiceSampleRepository.findAll();
		return announcerVoiceSamples.stream()
				.map(AnnouncerVoiceSampleResponseDto::from)  // AnnouncerVoiceSample -> AnnouncerVoiceSampleResponseDto로 변환
				.collect(Collectors.toList()); // 리스트로 수집
	}


	/**
	 * 모든 아나운서 샘플 조회
	 *
	 * @return Page<AnnouncerVoiceSampleResponseDto>
	 */
	@Override
	public Page<AnnouncerVoiceSampleResponseDto> getAllAnnouncerData(int pageNo, String criteria) {
		Pageable pageable = PageRequest.of(pageNo, 10, Sort.by(Sort.Direction.DESC, criteria));
		Page<AnnouncerVoiceSample> announcerVoiceSamples = announcerVoiceSampleRepository.findAll(pageable);

		// AnnouncerVoiceSample -> AnnouncerVoiceSampleResponseDto로 변환하여 Page로 반환
		Page<AnnouncerVoiceSampleResponseDto> announcerVoiceSampleResponseDtos = announcerVoiceSamples.map(AnnouncerVoiceSampleResponseDto::from);

		if (announcerVoiceSampleResponseDtos.isEmpty()) {
			log.info("없음");
		}
		log.info("pageEnd");

		return announcerVoiceSampleResponseDtos;
	}


	/**
	 * 사용자가 녹음한 아나운서 음성 분석 결과 단일 조회
	 * @param id 상세 조회 id
	 * @return userAnnouncerVoiceComparisonResult - 음성 분석 비교 결과
	 */
	@Override
	public UserAnnouncerVoiceComparisonResponseDto getOneUserToAnnouncerVoiceComparison(Long id) {
		UserAnnouncerVoiceComparisonResult userAnnouncerVoiceComparisonResult = userAnnouncerVoiceComparisonRepository.findById(id).orElse(null);
		log.info("사용자와 아나운서 음성 비교 상세 조회= {}", userAnnouncerVoiceComparisonResult);
		if (userAnnouncerVoiceComparisonResult == null) {
			return null;
		}
		return UserAnnouncerVoiceComparisonResponseDto.from(userAnnouncerVoiceComparisonResult);
	}

	/**
	 * 사용자가 녹음한 아나운서 음성 분석 결과 전체 조회
	 *
	 * @param pageNo   현재 페이지
	 * @param criteria 정렬 기준
	 * @param userId   사용자 id
	 * @return Page<UserAnnouncerVoiceComparisonResponseDto>
	 */
	@Override
	public Page<UserAnnouncerVoiceComparisonResponseDto> getAllUserToAnnouncerVoiceComparison(int pageNo, String criteria, Long userId) {
		Pageable pageable = PageRequest.of(pageNo, 10, Sort.by(Sort.Direction.DESC, criteria));
		Page<UserAnnouncerVoiceComparisonResult> all = userAnnouncerVoiceComparisonRepository.findByUserId(pageable, userId);
		return all.map(UserAnnouncerVoiceComparisonResponseDto::from);
	}

	/**
	 * 아나운서 따라잡기 사용자 음성 분석 결과 db 저장
	 *
	 * @param compareResultRequestDto 비교 결과
	 * @param recordAddress           주소
	 * @param userId                  사용자 id
	 * @return 저장된 정보의 PK
	 */
	@Override
	public Long saveComparisonResult(CompareResultRequestDto compareResultRequestDto, String recordAddress, Long userId) {
		return userAnnouncerVoiceComparisonRepository.save(CompareResultRequestDto.toEntity(compareResultRequestDto, userId, recordAddress)).getId();
	}
}
