package com.fixspeech.spring_server.domain.training.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.training.dto.TrainingResponseDto;
import com.fixspeech.spring_server.domain.training.model.TrainingSentence;
import com.fixspeech.spring_server.domain.training.repository.TrainingSentenceRepository;
import com.fixspeech.spring_server.domain.user.model.Users;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrainingServiceImpl implements TrainingService {
	private final TrainingSentenceRepository trainingSentenceRepository;
	private final RedisTemplate<String, String> redisTemplate;

	@Override
	public String getSentence(Users users, Long trainingId) {
		Long firstIdx = trainingSentenceRepository.findTopByTrainingIdOrderByIdAsc(trainingId).getId();
		Long lastIdx = trainingSentenceRepository.findTopByTrainingIdOrderByIdDesc(trainingId).getId();
		Long sentenceId = (long)(Math.random() * (lastIdx - firstIdx + 1) + firstIdx);
		String redisKey = "training_sentence:" + users.getId();
		if (Boolean.TRUE.equals(redisTemplate.hasKey(redisKey))) {
			System.out.println(redisTemplate.opsForValue().get(redisKey));
			redisTemplate.delete(redisKey);
		}

		TrainingSentence trainingSentence = trainingSentenceRepository.findById(sentenceId)
			.orElseThrow(() -> new RuntimeException("Sentence Not Found"));
		redisTemplate.opsForValue().set(redisKey, trainingSentence.getScript().replaceAll(" ", ""));

		String retrievedValue = redisTemplate.opsForValue().get(redisKey);

		// 출력
		System.out.println("저장된 값: " + retrievedValue);
		return trainingSentence.getScript();
	}

	@Override
	public TrainingResponseDto checkClarity(Users users, String s) {
		String newString = s.replaceAll(" ", "");
		String originalString = redisTemplate.opsForValue().get("training_sentence:" + users.getId());
		System.out.println(newString + " " + originalString);
		List<Integer> list = new ArrayList<>();
		int length = originalString.length();
		int cnt = 0;
		for (int i = 0; i < length; i++) {
			char original = originalString.charAt(i);
			char newChar = newString.charAt(i);
			if (original != newChar) {
				list.add(i);
				cnt++;
			}
		}
		System.out.println(length + " " + cnt);
		int score = (length - cnt) * 100 / length;
		TrainingResponseDto trainingResponseDto = new TrainingResponseDto(
			score,
			list
		);
		return trainingResponseDto;
	}

	@Override
	public void deleteRedis(Users users) {
		String redisKey = "training_sentence:" + users.getId();
		redisTemplate.delete(redisKey);
	}
}
