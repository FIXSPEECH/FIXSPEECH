package com.fixspeech.spring_server.domain.training.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixspeech.spring_server.domain.training.dto.TrainingResponseDto;
import com.fixspeech.spring_server.domain.training.service.TrainingService;
import com.fixspeech.spring_server.global.common.CommonResponse;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/*
1. 랜덤으로 문장 반환
2. 사용자 녹음 데이터 입력받고, 값 비교
3. 내가 녹음한 목소리 다시 듣기

 */
@RestController
@RequiredArgsConstructor
@RequestMapping("api/training")
public class TrainingController {
	private final TrainingService trainingService;

	@GetMapping("/{trainingId}/start")
	public CommonResponse<?> start(@PathVariable Long trainingId) {
		try {
			String s = trainingService.getSentence(trainingId);
			return CommonResponse.success(s, "연습 문장 불러오기 성공");
		} catch (Exception e) {
			throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping("/answer")
	public CommonResponse<?> answer(
		@RequestBody String s
	) {
		try {
			TrainingResponseDto trainingResponseDto = trainingService.checkClarity(s);
			return CommonResponse.success(trainingResponseDto, "채점 성공");
		} catch (Exception e) {
			throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
		}
	}

}