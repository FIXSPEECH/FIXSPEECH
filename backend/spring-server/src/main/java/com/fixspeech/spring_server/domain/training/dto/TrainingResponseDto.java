package com.fixspeech.spring_server.domain.training.dto;

import java.util.List;

public record TrainingResponseDto(
	int score,
	List<Integer> list
) {
}
