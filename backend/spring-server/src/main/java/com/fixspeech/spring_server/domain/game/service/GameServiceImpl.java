package com.fixspeech.spring_server.domain.game.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.game.dto.ResultRequestDto;
import com.fixspeech.spring_server.domain.game.dto.ResultResponseDto;
import com.fixspeech.spring_server.domain.game.model.Game;
import com.fixspeech.spring_server.domain.game.model.GameResult;
import com.fixspeech.spring_server.domain.game.model.GameWord;
import com.fixspeech.spring_server.domain.game.repository.GameRepository;
import com.fixspeech.spring_server.domain.game.repository.GameResultRepository;
import com.fixspeech.spring_server.domain.game.repository.GameWordRepository;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.repository.UserRepository;

import jakarta.transaction.Transactional;
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
	public List<String> getWord(int level) {
		Game game = gameRepository.findTopByLevel(level);
		List<GameWord> wordList = gameWordRepository.findAllByGameId(game.getId());
		List<String> words = new ArrayList<String>();
		for (GameWord word : wordList) {
			words.add(word.getWord());
		}
		Collections.shuffle(words);
		return words;
	}

	@Transactional
	@Override
	public void saveResult(Users user, ResultRequestDto resultRequestDto) {
		Game game = gameRepository.findTopByLevel(resultRequestDto.level());
		if (gameResultRepository.existsByGameIdAndUsers_Id(game.getId(), user.getId())) {
			gameResultRepository.deleteAllByGameIdAndUsers_Id(game.getId(), user.getId());
		}
		;
		GameResult gameResult = GameResult.builder()
			.users(user)
			.game(game)
			.correctNumber(resultRequestDto.correctNumber())
			.playtime(resultRequestDto.playtime())
			.build();
		gameResultRepository.save(gameResult);
	}

	@Override
	public Page<ResultResponseDto> getResult(int page, int size, int level) {
		Pageable pageable = PageRequest.of(page, size);
		Game game = gameRepository.findTopByLevel(level);
		Page<GameResult> resultPages = gameResultRepository.findAllByGameIdOrderByPlaytimeDesc(game.getId(), pageable);
		List<ResultResponseDto> resultResponseDtos = resultPages.stream()
			.map(this::convertToResultDto)
			.toList();
		return new PageImpl<>(resultResponseDtos, pageable, resultPages.getTotalElements());
	}

	private ResultResponseDto convertToResultDto(GameResult resultPage) {
		ResultResponseDto resultResponseDto = new ResultResponseDto(
			resultPage.getUsers().getNickName(),
			resultPage.getUsers().getImage(),
			resultPage.getGame().getLevel(),
			resultPage.getGame().getGameDescription(),
			resultPage.getPlaytime(),
			resultPage.getCorrectNumber(),
			resultPage.getCreatedAt()
		);
		return resultResponseDto;
	}
}