package com.fixspeech.spring_server.domain.announcer.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.announcer.dto.request.CompareResultRequestDto;
import com.fixspeech.spring_server.domain.announcer.dto.response.SmallAnnouncerVoiceSampleResponseDto;
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

	/**
	 * 아나운서 음성, 대본 데이터 단일, 랜덤 조회
	 * @return
	 */
	@Override
	public SmallAnnouncerVoiceSampleResponseDto getOneAnnouncerData(String gender) {
		List<AnnouncerVoiceSample> announcerVoiceSamples = announcerVoiceSampleRepository.findBySpeakerGender(gender.equals("male") ? "남성" : "여성");
		log.info("아나운서 음성 크기={}", announcerVoiceSamples.size());

		if (announcerVoiceSamples.isEmpty()) {
			return null; // 해당 성별의 아나운서 음성 샘플이 없다면 null 반환
		}

		// 랜덤 인덱스 생성
		long idx = (long)(Math.random() * announcerVoiceSamples.size());
		AnnouncerVoiceSample announcerVoiceSample = announcerVoiceSamples.get((int) idx);

		// 조회한 아나운서 음성 샘플을 DTO로 변환하여 반환
		return SmallAnnouncerVoiceSampleResponseDto.from(announcerVoiceSample);
	}

	/**
	 * 아나운서 음성 데이터 전체 조회
	 * @param pageNo   현재 페이지
	 * @param criteria 정렬 기준
	 * @return Page<SmallAnnouncerVoiceSampleResponseDto>
	 */
	@Override
	public Page<SmallAnnouncerVoiceSampleResponseDto> getAllAnnouncerData(int pageNo, String criteria) {
		Pageable pageable = PageRequest.of(pageNo, 10, Sort.by(Sort.Direction.DESC, criteria));
		Page<AnnouncerVoiceSample> announcerVoiceSamples = announcerVoiceSampleRepository.findAll(pageable);

		// AnnouncerVoiceSample -> AnnouncerVoiceSampleResponseDto로 변환하여 Page로 반환
		Page<SmallAnnouncerVoiceSampleResponseDto> announcerVoiceSampleResponseDtos = announcerVoiceSamples.map(SmallAnnouncerVoiceSampleResponseDto::from);
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
