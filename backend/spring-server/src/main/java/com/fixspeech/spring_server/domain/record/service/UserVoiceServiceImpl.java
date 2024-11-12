package com.fixspeech.spring_server.domain.record.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.record.dto.AnalyzeResultResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceListResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;
import com.fixspeech.spring_server.domain.record.model.AnalyzeJsonResult;
import com.fixspeech.spring_server.domain.record.model.AnalyzeResult;
import com.fixspeech.spring_server.domain.record.model.UserVoiceFile;
import com.fixspeech.spring_server.domain.record.repository.AnalyzeJsonResultRepository;
import com.fixspeech.spring_server.domain.record.repository.AnalyzeResultRepository;
import com.fixspeech.spring_server.domain.record.repository.UserVoiceRepository;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserVoiceServiceImpl implements UserVoiceService {

	private final UserVoiceRepository userVoiceRepository;
	private final AnalyzeJsonResultRepository analyzeJsonResultRepository;
	private final AnalyzeResultRepository analyzeResultRepository;

	@Transactional
	@Override
	public Long saveFile(UserVoiceRequestDto userVoiceRequestDto, String fileUrl, Long userId) {
		UserVoiceFile userVoiceFile = UserVoiceFile.builder()
			.userId(userId)
			.recordTitle(userVoiceRequestDto.getRecordTitle())
			.recordAddress(fileUrl)
			.build();
		userVoiceRepository.save(userVoiceFile);
		UserVoiceFile newUserVoiceFile = userVoiceRepository.findTopByUserIdOrderByCreatedAtDesc(userId);
		return newUserVoiceFile.getId();
	}

	@Override
	public void saveResult(UserVoiceRequestDto userVoiceRequestDto, Long userId, Long recordId) {
		UserVoiceFile userVoiceFile = userVoiceRepository.findById(recordId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		Map<String, Object> data = userVoiceRequestDto.getData();
		Map<String, Object> metrics = (Map<String, Object>)data.get("metrics");
		AnalyzeJsonResult analyzeResult = AnalyzeJsonResult.builder()
			.userVoiceFile(userVoiceFile)
			.data(userVoiceRequestDto.getAnalyzeResult())
			.build();

		analyzeJsonResultRepository.save(analyzeResult);
	}

	@Override
	public UserVoiceListResponseDto getUserRecordDetail(Users users, Long resultId) {

		AnalyzeJsonResult analyzeResult = analyzeJsonResultRepository.findById(resultId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		if (!Objects.equals(analyzeResult.getUserVoiceFile().getUserId(), users.getId()))
			throw new CustomException(ErrorCode.AUTHENTICATION_FAIL_ERROR);
		return convertToUserVoiceDto(analyzeResult, resultId);
	}

	/**
	 * 사용자가 가장 최근에 녹음한 음성 결과를 조회
	 * @param userId 사용자 PK
	 * @return AnalyzeResultResponseDto
	 */
	@Override
	public AnalyzeResultResponseDto getUserOneAnalyzeResult(Long userId) {
		AnalyzeResult analyzeResult = analyzeResultRepository.findTopByUserIdOrderByCreatedAtDesc(userId);
		return AnalyzeResultResponseDto.from(analyzeResult);
	}

	private UserVoiceListResponseDto convertToUserVoiceDto(AnalyzeJsonResult analyzeResult, Long resultId) {

		UserVoiceFile userVoiceFile = analyzeResult.getUserVoiceFile();
		Map<String, Object> rawData = analyzeResult.getData();

		// 새로운 데이터 구조에 맞게 변환
		Map<String, Object> metrics = (Map<String, Object>)rawData.get("metrics");

		// 새로운 응답 데이터 구조 생성
		Map<String, Object> responseData = Map.of(
			"metrics", metrics
		);
		UserVoiceListResponseDto userVoiceListResponseDto = new UserVoiceListResponseDto(
			responseData,
			userVoiceFile.getRecordTitle(),
			userVoiceFile.getRecordAddress(),
			userVoiceFile.getCreatedAt().toLocalDate()
		);
		return userVoiceListResponseDto;
	}

	@Override
	public Page<UserVoiceListResponseDto> getUserRecordList(int page, int size, Long userId) {
		Pageable pageable = PageRequest.of(page, size);
		Page<AnalyzeJsonResult> analyzePages = analyzeJsonResultRepository.findAllByUserVoiceFile_UserId(userId,
			pageable);

		List<UserVoiceListResponseDto> userVoiceListResponseDtos = analyzePages.stream()
			.map(analyzeResult -> {
				UserVoiceFile userVoiceFile = analyzeResult.getUserVoiceFile();
				Map<String, Object> rawData = analyzeResult.getData();

				// 새로운 데이터 구조에 맞게 변환
				Map<String, Object> metrics = (Map<String, Object>)rawData.get("metrics");

				// 새로운 응답 데이터 구조 생성
				Map<String, Object> responseData = Map.of(
					"metrics", metrics
				);

				return new UserVoiceListResponseDto(
					responseData,
					userVoiceFile.getRecordTitle(),
					userVoiceFile.getRecordAddress(),
					userVoiceFile.getCreatedAt().toLocalDate()
				);
			})
			.toList();

		return new PageImpl<>(userVoiceListResponseDtos, pageable, analyzePages.getTotalElements());
	}

}
