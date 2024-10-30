package com.fixspeech.spring_server.domain.training.service;

import com.fixspeech.spring_server.domain.training.dto.TrainingResponseDto;

public interface TrainingService {
	String getSentence(Long trainingId);

	TrainingResponseDto checkClarity(String s);
}
