package com.fixspeech.spring_server.domain.script.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.script.model.Script;

@Repository
public interface ScriptRepository extends JpaRepository<Script, Long> {

	Script findTopByUserIdOrderByCreatedAtDesc(Long id);

	Page<Script> findAllByUserIdOrderByCreatedAtDesc(Long id, Pageable pageable);
}
