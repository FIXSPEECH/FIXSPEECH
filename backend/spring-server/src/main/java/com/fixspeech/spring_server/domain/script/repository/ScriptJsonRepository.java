package com.fixspeech.spring_server.domain.script.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fixspeech.spring_server.domain.script.model.ScriptJson;

public interface ScriptJsonRepository extends JpaRepository<ScriptJson, Long> {
}
