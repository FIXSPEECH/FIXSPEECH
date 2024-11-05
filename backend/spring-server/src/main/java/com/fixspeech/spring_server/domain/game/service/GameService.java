package com.fixspeech.spring_server.domain.game.service;

import java.util.List;

import com.fixspeech.spring_server.domain.game.model.Game;

public interface GameService {
	List<Game> getGame();

	List<String> getWord(Long level);
}
