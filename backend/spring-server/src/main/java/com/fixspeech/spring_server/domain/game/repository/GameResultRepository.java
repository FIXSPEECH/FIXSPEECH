package com.fixspeech.spring_server.domain.game.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.game.model.GameResult;

@Repository
public interface GameResultRepository extends JpaRepository<GameResult, Long> {
	Page<GameResult> findAllByGameId(Long level, Pageable pageable);

	Page<GameResult> findAllByGameIdOrderByPlaytimeDesc(Long id, Pageable pageable);

	boolean existsByGameIdAndUsers_Id(Long gameId, Long userId);

	void deleteAllByGameIdAndUsers_Id(Long gameId, Long userId);

	GameResult findByGameIdAndUsers_Id(Long id, Long id1);
}
