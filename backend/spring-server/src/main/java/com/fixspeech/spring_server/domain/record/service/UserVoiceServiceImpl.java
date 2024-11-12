package com.fixspeech.spring_server.domain.record.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.config.s3.S3Service;
import com.fixspeech.spring_server.domain.record.conotroller.UserVoiceController;
import com.fixspeech.spring_server.domain.record.dto.AnalyzeResultResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceListResponseDto;
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
	private final S3Service s3Service;

	@Transactional
	@Override
	public Map<String, Object> analyzeAndSave(Users users, MultipartFile file) {

		try {
			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("file", new UserVoiceController.MultipartInputStreamFileResource(file.getInputStream(),
				file.getOriginalFilename()));
			body.add("gender", users.getGender());
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);
			HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
			RestTemplate restTemplate = new RestTemplate();
			ResponseEntity<Map> response = restTemplate.exchange(
				"https://k11d206.p.ssafy.io/fastapi/analyze/full",
				HttpMethod.POST,
				requestEntity,
				Map.class
			);
			Map<String, Object> analysisData = response.getBody();
			Map<String, Object> metrics = (Map<String, Object>)analysisData.get("data");
			String fileUrl = s3Service.upload(file);
			String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

			UserVoiceFile userVoiceFile = UserVoiceFile.builder()
				.userId(users.getId())
				.recordTitle(timestamp)
				.recordAddress(fileUrl)
				.build();
			userVoiceRepository.save(userVoiceFile);

			AnalyzeJsonResult analyzeResult = AnalyzeJsonResult.builder()
				.userVoiceFile(userVoiceFile)
				.data(metrics)
				.build();
			analyzeJsonResultRepository.save(analyzeResult);

			return metrics;
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_UPLOAD_RECORD);
		}
	}

	@Transactional
	@Override
	public void deleteRecord(Users users, Long recordId) {
		UserVoiceFile userVoiceFile = userVoiceRepository.findById(recordId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		if (!Objects.equals(users.getId(), userVoiceFile.getUserId()))
			throw new CustomException(ErrorCode.AUTHENTICATION_FAIL_ERROR);
		userVoiceRepository.deleteById(recordId);
	}

	// @Override
	// public void saveResult(UserVoiceRequestDto userVoiceRequestDto, Long userId, Long recordId) {
	// 	UserVoiceFile userVoiceFile = userVoiceRepository.findById(recordId)
	// 		.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
	// 	Map<String, Object> data = userVoiceRequestDto.getData();
	// 	Map<String, Object> metrics = (Map<String, Object>)data.get("metrics");
	// 	AnalyzeJsonResult analyzeResult = AnalyzeJsonResult.builder()
	// 		.userVoiceFile(userVoiceFile)
	// 		.data(userVoiceRequestDto.getAnalyzeResult())
	// 		.build();
	//
	// 	analyzeJsonResultRepository.save(analyzeResult);
	// }

	@Override
	public UserVoiceListResponseDto getUserRecordDetail(Users users, Long recordId) {

		UserVoiceFile userVoiceFile = userVoiceRepository.findById(recordId)
			.orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND));
		Long resultId = userVoiceFile.getId();
		AnalyzeJsonResult analyzeResult = analyzeJsonResultRepository.findTopByRecordId(resultId);
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
			userVoiceFile.getId(),
			userVoiceFile.getCreatedAt().toLocalDate()
		);
		return userVoiceListResponseDto;
	}

	@Override
	public Page<UserVoiceListResponseDto> getUserRecordList(int page, int size, Long userId) {
		try {
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
						userVoiceFile.getId(),
						userVoiceFile.getCreatedAt().toLocalDate()
					);
				})
				.toList();

			return new PageImpl<>(userVoiceListResponseDtos, pageable, analyzePages.getTotalElements());
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_LOAD_RECORD_LIST);
		}
	}

	@Override
	public ResponseEntity<Map> analyze(Users users, MultipartFile file) {
		try {

			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("file", new UserVoiceController.MultipartInputStreamFileResource(file.getInputStream(),
				file.getOriginalFilename()));
			body.add("gender", users.getGender());
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);

			HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
			RestTemplate restTemplate = new RestTemplate();
			ResponseEntity<Map> response = restTemplate.exchange(
				"https://k11d206.p.ssafy.io/fastapi/analyze/full",
				HttpMethod.POST,
				requestEntity,
				Map.class
			);
			return response;
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_ANALYZE_RECORD);
		}
	}

}
