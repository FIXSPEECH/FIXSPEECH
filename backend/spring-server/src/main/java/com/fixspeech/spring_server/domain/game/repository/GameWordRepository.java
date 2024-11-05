package com.fixspeech.spring_server.domain.game.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.game.model.GameWord;

@Repository
public interface GameWordRepository extends JpaRepository<GameWord, Long> {
}
