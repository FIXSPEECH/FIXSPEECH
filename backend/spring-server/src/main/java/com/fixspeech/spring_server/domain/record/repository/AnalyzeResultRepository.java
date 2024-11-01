package com.fixspeech.spring_server.domain.record.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fixspeech.spring_server.domain.record.model.AnalyzeResult;

public interface AnalyzeResultRepository extends JpaRepository<AnalyzeResult,Long> {
}
