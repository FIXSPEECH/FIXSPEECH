package com.fixspeech.spring_server.domain.announcer.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.announcer.dto.AnnouncerResponseDto;
import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSample;
import com.fixspeech.spring_server.domain.announcer.repository.AnnouncerRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnnouncerServiceImpl implements AnnouncerService {

	private final AnnouncerRepository announcerRepository;

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
}
