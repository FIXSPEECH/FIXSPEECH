package com.fixspeech.spring_server.domain.training.service;

import com.fixspeech.spring_server.domain.training.dto.TrainingResponseDto;
import com.fixspeech.spring_server.domain.user.model.Users;

public interface TrainingService {
	String getSentence(Users user, Long trainingId);

	TrainingResponseDto checkClarity(Users users, String s);

	void deleteRedis(Users users);
}
