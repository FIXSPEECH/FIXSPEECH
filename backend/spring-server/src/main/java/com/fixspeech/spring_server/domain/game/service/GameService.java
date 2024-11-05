package com.fixspeech.spring_server.domain.game.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.fixspeech.spring_server.domain.game.dto.ResultRequestDto;
import com.fixspeech.spring_server.domain.game.dto.ResultResponseDto;
import com.fixspeech.spring_server.domain.game.model.Game;
import com.fixspeech.spring_server.domain.user.model.Users;

public interface GameService {
	List<Game> getGame();

	List<String> getWord(int level);

	void saveResult(Users user, ResultRequestDto resultRequestDto);

	Page<ResultResponseDto> getResult(int page, int size, int level);
}
