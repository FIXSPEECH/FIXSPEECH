package com.fixspeech.spring_server.domain.record.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;
import com.fixspeech.spring_server.domain.record.model.AnalyzeResult;
import com.fixspeech.spring_server.domain.record.model.UserVoiceFile;
import com.fixspeech.spring_server.domain.record.repository.AnalyzeResultRepository;
import com.fixspeech.spring_server.domain.record.repository.UserVoiceRepository;

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
			.recordName(userVoiceRequestDto.getUserVoiceName())
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
			.intonationPatternConsistency(String.valueOf(metricsData.get("억양 패턴 일관성 (Intonation Pattern Consistency)")))
			.melodyIndex((float) Double.parseDouble(metricsData.get("멜로디 지수(Melody Index)").toString()))
			.speechRhythm((float) Double.parseDouble(metricsData.get("말의 리듬(Speech Rhythm)").toString()))
			.pauseTiming((float) Double.parseDouble(metricsData.get("휴지 타이밍(Pause Timing)").toString()))
			.rateVariability((float) Double.parseDouble(metricsData.get("속도 변동성(Rate Variability)").toString()))
			.jitter((float) Double.parseDouble(metricsData.get("성대 떨림(Jitter)").toString()))
			.shimmer((float) Double.parseDouble(metricsData.get("강도 변동성(Shimmer)").toString()))
			.amr((float) Double.parseDouble(metricsData.get("강도 변동성(AMR)").toString()))
			.utteranceEnergy((float) Double.parseDouble(metricsData.get("발화의 에너지(Utterance Energy)").toString()))
			.build();

		 analyzeResultRepository.save(analyzeResult);
	}
}
