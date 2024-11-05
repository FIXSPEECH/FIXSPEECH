package com.fixspeech.spring_server.domain.game.service;

import java.util.List;

import com.fixspeech.spring_server.domain.game.dto.ResultRequestDto;
import com.fixspeech.spring_server.domain.game.model.Game;
import com.fixspeech.spring_server.domain.user.model.Users;

public interface GameService {
	List<Game> getGame();

	List<String> getWord(Long level);

	void saveResult(Users user, ResultRequestDto resultRequestDto);
}
