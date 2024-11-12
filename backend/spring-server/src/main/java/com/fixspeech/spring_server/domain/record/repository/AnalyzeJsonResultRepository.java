package com.fixspeech.spring_server.domain.record.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fixspeech.spring_server.domain.record.model.AnalyzeJsonResult;
import com.fixspeech.spring_server.domain.record.model.UserVoiceFile;

public interface AnalyzeJsonResultRepository extends JpaRepository<AnalyzeJsonResult, Long> {
	Page<AnalyzeJsonResult> findAllByUserVoiceFile_UserId(Long userId, Pageable pageable);

	AnalyzeJsonResult findTopByUserVoiceFile(UserVoiceFile userVoiceFile);
}
