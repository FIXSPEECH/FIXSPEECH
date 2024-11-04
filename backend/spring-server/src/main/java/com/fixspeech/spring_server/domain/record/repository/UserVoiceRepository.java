package com.fixspeech.spring_server.domain.record.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fixspeech.spring_server.domain.record.model.UserVoiceFile;

public interface UserVoiceRepository extends JpaRepository<UserVoiceFile,Long> {
	UserVoiceFile findTopByUserIdOrderByCreatedAtDesc(Long userId);
}
