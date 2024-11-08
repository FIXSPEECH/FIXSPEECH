package com.fixspeech.spring_server.domain.script.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.script.model.ScriptAnalyzeResult;

@Repository
public interface ScriptAnalyzeResultRepository extends JpaRepository<ScriptAnalyzeResult, Long> {
}
