package com.fixspeech.spring_server.domain.record.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
	public void saveImage(UserVoiceRequestDto userVoiceRequestDto) {
		System.out.println("service: "+userVoiceRequestDto);
		UserVoiceFile userVoiceFile = UserVoiceFile.builder()
			.userId(userVoiceRequestDto.getUserId())
			.recordTitle(userVoiceRequestDto.getUserVoiceTitle())
			.recordAddress(userVoiceRequestDto.getUserVoiceAddress())
			.build();
		System.out.println("file: "+userVoiceFile);
		userVoiceRepository.save(userVoiceFile);
	}

	@Override
	public void saveResult(Map<String, Object> responseData, Long userId) {

		Map<String, Object> metricsData = (Map<String, Object>)((Map<String, Object>) responseData.get("data")).get("metrics");
		// AnalyzeResult 엔티티 생성
		AnalyzeResult analyzeResult = AnalyzeResult.builder()
			.userId(userId)
			.clarity((float) Double.parseDouble(metricsData.get("명료도(Clarity)").toString()))
			.intonationPatternConsistency((float) Double.parseDouble(metricsData.get("억양 패턴 일관성 (Intonation Pattern Consistency)").toString()))
			.melodyIndex((float) Double.parseDouble(metricsData.get("멜로디 지수(Melody Index)").toString()))
			.speechRhythm((float) Double.parseDouble(metricsData.get("말의 리듬(Speech Rhythm)").toString()))
			.pauseTiming((float) Double.parseDouble(metricsData.get("휴지 타이밍(Pause Timing)").toString()))
			.rateVariability((float) Double.parseDouble(metricsData.get("속도 변동성(Rate Variability)").toString()))
			.jitter((float) Double.parseDouble(metricsData.get("성대 떨림(Jitter)").toString()))
			.amr((float) Double.parseDouble(metricsData.get("강도 변동성(AMR)").toString()))
			.utteranceEnergy((float) Double.parseDouble(metricsData.get("발화의 에너지(Utterance Energy)").toString()))
			.build();

		 analyzeResultRepository.save(analyzeResult);
	}

	@Override
	public UserVoiceListResponseDto getUserRecordDetail(Long resultId) {

		return convertTouserVoiceDto(resultId);
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
		Page<AnalyzeResult> analyzePages = analyzeResultRepository.findAllByUserId(userId,pageable);
		List<UserVoiceListResponseDto> userVoiceListResponseDtos = analyzePages.stream()
			.map(analyzePage->{
				return convertTouserVoiceDto(analyzePage.getRecordId());
				}

			)
			.toList();
		return new PageImpl<>(userVoiceListResponseDtos, pageable, analyzePages.getTotalElements());
	}

}
