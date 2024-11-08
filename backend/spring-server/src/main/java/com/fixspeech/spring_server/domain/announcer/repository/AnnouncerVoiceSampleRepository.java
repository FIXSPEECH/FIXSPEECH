package com.fixspeech.spring_server.domain.announcer.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.announcer.dto.response.AnnouncerVoiceSampleResponseDto;
import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSample;

@Repository
public interface AnnouncerVoiceSampleRepository extends JpaRepository<AnnouncerVoiceSample, Long> {
	// DTO로 데이터를 반환하는 쿼리 예시
	@Query("SELECT new com.fixspeech.spring_server.domain.announcer.dto.response.AnnouncerVoiceSampleResponseDto(avsd.id, a.sampleAddress, avsd.text) " +
		"FROM AnnouncerVoiceSample a " +
		"JOIN a.announcerVoiceSampleScriptDetail avsd")
	Page<AnnouncerVoiceSampleResponseDto> findAllWithJoin(Pageable pageable);
}
