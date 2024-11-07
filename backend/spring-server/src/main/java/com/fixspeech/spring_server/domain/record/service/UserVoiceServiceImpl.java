package com.fixspeech.spring_server.domain.record.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.record.dto.AnalyzeResponseDto;
import com.fixspeech.spring_server.domain.record.dto.AnalyzeResultResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceListResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;
import com.fixspeech.spring_server.domain.record.model.AnalyzeResult;
import com.fixspeech.spring_server.domain.record.model.UserVoiceFile;
import com.fixspeech.spring_server.domain.record.repository.AnalyzeResultRepository;
import com.fixspeech.spring_server.domain.record.repository.UserVoiceRepository;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserVoiceServiceImpl implements UserVoiceService {

	private final UserVoiceRepository userVoiceRepository;
	private final AnalyzeResultRepository analyzeResultRepository;

	@Transactional
	@Override
	public Long saveImage(UserVoiceRequestDto userVoiceRequestDto, String fileUrl, Long userId) {
		System.out.println("service: " + userVoiceRequestDto);
		UserVoiceFile userVoiceFile = UserVoiceFile.builder()
			.userId(userId)
			.recordTitle(userVoiceRequestDto.getRecordTitle())
			.recordAddress(fileUrl)
			.build();
		System.out.println("file: " + userVoiceFile);
		userVoiceRepository.save(userVoiceFile);
		UserVoiceFile newUserVoiceFile = userVoiceRepository.findTopByUserIdOrderByCreatedAtDesc(userId);
		return newUserVoiceFile.getId();
	}

	@Override
	public void saveResult(UserVoiceRequestDto userVoiceRequestDto, Long userId, Long recordId) {
		AnalyzeResult analyzeResult = AnalyzeResult.builder()
			.userId(userId)
			.recordId(recordId)
			.clarity(userVoiceRequestDto.getClarity())
			.intonationPatternConsistency(userVoiceRequestDto.getIntonationPatternConsistency())
			.melodyIndex(userVoiceRequestDto.getMelodyIndex())
			.speechRhythm(userVoiceRequestDto.getSpeechRhythm())
			.rateVariability(userVoiceRequestDto.getRateVariability())
			.pauseTiming(userVoiceRequestDto.getPauseTiming())
			.jitter(userVoiceRequestDto.getJitter())
			.amr(userVoiceRequestDto.getAmr())
			.utteranceEnergy(userVoiceRequestDto.getUtteranceEnergy())
			.build();
		analyzeResultRepository.save(analyzeResult);
	}

	@Override
	public AnalyzeResponseDto preProcessing(Map<String, Object> responseData) {

		Map<String, Object> metricsData = (Map<String, Object>)((Map<String, Object>)responseData.get("data")).get(
			"metrics");
		// AnalyzeResult 엔티티 생성
		AnalyzeResponseDto analyzeResponseDto = new AnalyzeResponseDto(
			(float)Double.parseDouble(metricsData.get("명료도(Clarity)").toString()),
			(float)Double.parseDouble(metricsData.get("억양 패턴 일관성 (Intonation Pattern Consistency)").toString()),
			(float)Double.parseDouble(metricsData.get("멜로디 지수(Melody Index)").toString()),
			(float)Double.parseDouble(metricsData.get("말의 리듬(Speech Rhythm)").toString()),
			(float)Double.parseDouble(metricsData.get("휴지 타이밍(Pause Timing)").toString()),
			(float)Double.parseDouble(metricsData.get("속도 변동성(Rate Variability)").toString()),
			(float)Double.parseDouble(metricsData.get("성대 떨림(Jitter)").toString()),
			(float)Double.parseDouble(metricsData.get("강도 변동성(AMR)").toString()),
			(float)Double.parseDouble(metricsData.get("발화의 에너지(Utterance Energy)").toString())
		);
		return analyzeResponseDto;
	}

	@Override
	public UserVoiceListResponseDto getUserRecordDetail(Long resultId) {

		return convertTouserVoiceDto(resultId);
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

	private UserVoiceListResponseDto convertTouserVoiceDto(Long resultId) {
		AnalyzeResult analyzeResult = analyzeResultRepository.findById(resultId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		UserVoiceFile userVoiceFile = userVoiceRepository.findById(analyzeResult.getRecordId())
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		UserVoiceListResponseDto userVoiceListResponseDto = new UserVoiceListResponseDto(
			analyzeResult,
			userVoiceFile.getRecordTitle(),
			userVoiceFile.getRecordAddress(),
			userVoiceFile.getCreatedAt()
		);
		return userVoiceListResponseDto;
	}

	@Override
	public Page<UserVoiceListResponseDto> getUserRecordList(int page, int size, Long userId) {
		Pageable pageable = PageRequest.of(page, size);
		Page<AnalyzeResult> analyzePages = analyzeResultRepository.findAllByUserId(userId, pageable);
		List<UserVoiceListResponseDto> userVoiceListResponseDtos = analyzePages.stream()
			.map(analyzePage -> convertTouserVoiceDto(analyzePage.getRecordId())
			)
			.toList();
		return new PageImpl<>(userVoiceListResponseDtos, pageable, analyzePages.getTotalElements());
	}

}
