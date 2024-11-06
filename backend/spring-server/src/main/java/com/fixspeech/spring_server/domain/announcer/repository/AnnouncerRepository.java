package com.fixspeech.spring_server.domain.announcer.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSample;

@Repository
public interface AnnouncerRepository extends JpaRepository<AnnouncerVoiceSample, Long> {
	List<AnnouncerVoiceSample> findAll();
}
