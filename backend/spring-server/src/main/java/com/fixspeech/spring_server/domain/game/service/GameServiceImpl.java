package com.fixspeech.spring_server.domain.game.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.game.model.Game;
import com.fixspeech.spring_server.domain.game.repository.GameRepository;
import com.fixspeech.spring_server.domain.game.repository.GameResultRepository;
import com.fixspeech.spring_server.domain.game.repository.GameWordRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class GameServiceImpl implements GameService {
	private final GameRepository gameRepository;
	private final GameWordRepository gameWordRepository;
	private final GameResultRepository gameResultRepository;

	@Override
	public List<Game> getGame() {
		List<Game> games = gameRepository.findAll();
		return games;
	}
}
