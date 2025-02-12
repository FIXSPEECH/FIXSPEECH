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

import com.amazonaws.services.s3.AmazonS3;
import com.fixspeech.spring_server.config.s3.S3Service;
import com.fixspeech.spring_server.domain.record.conotroller.UserVoiceController;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceListResponseDto;
import com.fixspeech.spring_server.domain.record.model.AnalyzeJsonResult;
import com.fixspeech.spring_server.domain.record.model.UserVoiceFile;
import com.fixspeech.spring_server.domain.record.repository.AnalyzeJsonResultRepository;
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
	private final S3Service s3Service;
	private final AmazonS3 amazonS3;

	@Transactional
	@Override
	public Map<String, Object> analyzeAndSave(Users users, MultipartFile file) {

		try {
			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("file", new UserVoiceController.MultipartInputStreamFileResource(file.getInputStream(),
				file.getOriginalFilename()));
			body.add("gender", users.getGender() != null ? users.getGender() : "male");
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
			.orElseThrow(() -> new CustomException(ErrorCode.RECORD_NOT_FOUND));
		if (!Objects.equals(users.getId(), userVoiceFile.getUserId()))
			throw new CustomException(ErrorCode.AUTHENTICATION_FAIL_ERROR);
		try {
			// Delete file from S3
			String fileUrl = userVoiceFile.getRecordAddress();
			String key = fileUrl.replace(amazonS3.getUrl(s3Service.getBucket(), "").toString(), "");
			amazonS3.deleteObject(s3Service.getBucket(), key);

			// Delete record from database
			userVoiceRepository.deleteById(recordId);
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_DELETE_RECORD);
		}
	}

	@Override
	public UserVoiceListResponseDto getRecent(Users users) {
		UserVoiceFile userVoiceFile = userVoiceRepository.findTopByUserIdOrderByCreatedAtDesc(users.getId());
		if (userVoiceFile == null)
			throw new CustomException(ErrorCode.RECORD_NOT_FOUND);
		AnalyzeJsonResult result = analyzeJsonResultRepository.findTopByUserVoiceFile(userVoiceFile);
		return convertToUserVoiceDto(result, result.getId());
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
			.orElseThrow(() -> new CustomException(ErrorCode.RECORD_NOT_FOUND));
		AnalyzeJsonResult analyzeResult = analyzeJsonResultRepository.findTopByUserVoiceFile(userVoiceFile);
		if (!Objects.equals(analyzeResult.getUserVoiceFile().getUserId(), users.getId()))
			throw new CustomException(ErrorCode.AUTHENTICATION_FAIL_ERROR);
		return convertToUserVoiceDto(analyzeResult, userVoiceFile.getId());
	}

	private UserVoiceListResponseDto convertToUserVoiceDto(AnalyzeJsonResult analyzeResult, Long resultId) {

		UserVoiceFile userVoiceFile = analyzeResult.getUserVoiceFile();
		Map<String, Object> rawData = analyzeResult.getData();

		// 새로운 데이터 구조에 맞게 변환
		Map<String, Object> metrics = (Map<String, Object>)rawData.get("metrics");

		Integer overallScore = (Integer)rawData.get("overall_score");

		// recommendations는 List
		List<String> recommendations = (List<String>)rawData.get("recommendations");
		// 새로운 응답 데이터 구조 생성
		Map<String, Object> responseData = Map.of(
			"metrics", metrics,
			"overallScore", overallScore,
			"recommendations", recommendations
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
			Page<AnalyzeJsonResult> analyzePages = analyzeJsonResultRepository.findAllByUserVoiceFile_UserIdOrderByCreatedAtDesc(
				userId,
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
