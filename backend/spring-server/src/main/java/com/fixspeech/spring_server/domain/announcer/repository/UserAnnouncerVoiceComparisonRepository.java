package com.fixspeech.spring_server.domain.announcer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.announcer.model.UserAnnouncerVoiceComparisonResult;

@Repository
public interface UserAnnouncerVoiceComparisonRepository extends JpaRepository<UserAnnouncerVoiceComparisonResult, Long> {
}
