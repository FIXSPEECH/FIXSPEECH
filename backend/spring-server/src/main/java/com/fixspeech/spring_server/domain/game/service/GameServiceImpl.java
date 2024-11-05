package com.fixspeech.spring_server.domain.game.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.game.model.Game;
import com.fixspeech.spring_server.domain.game.model.GameWord;
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
		return gameRepository.findAll();
	}

	@Override
	public List<String> getWord(Long level) {
		List<GameWord> wordList = gameWordRepository.findAllByGameId(level);
		List<String> words = new ArrayList<String>();
		for (GameWord word : wordList) {
			words.add(word.getWord());
		}
		Collections.shuffle(words);
		return words;
	}
}
