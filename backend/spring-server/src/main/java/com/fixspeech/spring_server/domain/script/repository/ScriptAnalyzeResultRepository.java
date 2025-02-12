package com.fixspeech.spring_server.domain.script.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.script.model.Script;
import com.fixspeech.spring_server.domain.script.model.ScriptAnalyzeResult;

@Repository
public interface ScriptAnalyzeResultRepository extends JpaRepository<ScriptAnalyzeResult, Long> {
	Page<ScriptAnalyzeResult> findAllByScriptIdOrderByCreatedAtDesc(Long scriptId, Pageable pageable);

	ScriptAnalyzeResult findTopByScriptOrderByCreatedAtDesc(Script script);
}
