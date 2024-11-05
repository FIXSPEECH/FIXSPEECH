package com.fixspeech.spring_server.domain.game.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.game.dto.ResultRequestDto;
import com.fixspeech.spring_server.domain.game.model.Game;
import com.fixspeech.spring_server.domain.game.model.GameResult;
import com.fixspeech.spring_server.domain.game.model.GameWord;
import com.fixspeech.spring_server.domain.game.repository.GameRepository;
import com.fixspeech.spring_server.domain.game.repository.GameResultRepository;
import com.fixspeech.spring_server.domain.game.repository.GameWordRepository;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class GameServiceImpl implements GameService {
	private final GameRepository gameRepository;
	private final GameWordRepository gameWordRepository;
	private final GameResultRepository gameResultRepository;
	private final UserRepository userRepository;

	@Override
	public List<Game> getGame() {
		return gameRepository.findAll();
	}

	@Override
	public List<String> getWord(Long gameId) {
		List<GameWord> wordList = gameWordRepository.findAllByGameId(gameId);
		List<String> words = new ArrayList<String>();
		for (GameWord word : wordList) {
			words.add(word.getWord());
		}
		Collections.shuffle(words);
		return words;
	}

	@Override
	public void saveResult(Users user, ResultRequestDto resultRequestDto) {
		Game game = gameRepository.findTopByLevel(resultRequestDto.level());

		GameResult gameResult = GameResult.builder()
			.users(user)
			.game(game)
			.correctNumber(resultRequestDto.correctNumber())
			.playtime(resultRequestDto.playtime())
			.build();
		gameResultRepository.save(gameResult);
	}
}
