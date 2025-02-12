package com.fixspeech.spring_server.domain.script.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.services.s3.AmazonS3;
import com.fixspeech.spring_server.config.s3.S3Service;
import com.fixspeech.spring_server.domain.record.repository.UserVoiceRepository;
import com.fixspeech.spring_server.domain.script.dto.ScriptAnalyzeResponseDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptListDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptRequestDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptResponseDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptResultListDto;
import com.fixspeech.spring_server.domain.script.dto.VoiceAnalysisMessage;
import com.fixspeech.spring_server.domain.script.model.Script;
import com.fixspeech.spring_server.domain.script.model.ScriptAnalyzeResult;
import com.fixspeech.spring_server.domain.script.repository.ScriptAnalyzeResultRepository;
import com.fixspeech.spring_server.domain.script.repository.ScriptRepository;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class ScriptServiceImpl implements ScriptService {
	private final ScriptRepository scriptRepository;
	private final ScriptAnalyzeResultRepository scriptAnalyzeResultRepository;
	private final RestTemplate restTemplate;
	private final UserVoiceRepository userVoiceRepository;
	private final RedisTemplate<String, byte[]> redisTemplate;
	private final KafkaTemplate<String, VoiceAnalysisMessage> kafkaTemplate;
	private final S3Service s3Service;
	private final AmazonS3 amazonS3;

	@Override
	public Long uploadScript(ScriptRequestDto scriptRequestDto, Users users) {
		try {
			Script script = Script.builder()
				.user(users)
				.title(scriptRequestDto.title())
				.content(scriptRequestDto.content())
				.accent(scriptRequestDto.accent())
				.second(scriptRequestDto.minute() * 60 + scriptRequestDto.second())
				.build();
			scriptRepository.save(script);
			return scriptRepository.findTopByUserIdOrderByCreatedAtDesc(users.getId()).getId();
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_SAVE_SCRIPT);
		}
	}

	@Override
	public Page<ScriptListDto> getScriptList(Users users, int page, int size) {
		try {
			Pageable pageable = PageRequest.of(page, size);
			Page<Script> scriptPages = scriptRepository.findAllByUserIdOrderByCreatedAtDesc(users.getId(), pageable);
			List<ScriptListDto> scriptList = scriptPages.getContent().stream()
				.map(script ->
					new ScriptListDto(
						script.getTitle(),
						script.getSecond(),
						script.getId(),
						script.getCreatedAt().toLocalDate()
					)
				).toList();
			return new PageImpl<>(scriptList, pageable, scriptPages.getTotalElements());
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_LOAD_SCRIPT_RESULT_LIST);
		}
	}

	@Override
	public ScriptResponseDto getScript(Long scriptId, Users users) {
		Script script = findScript(scriptId);
		if (!script.getUser().equals(users))
			throw new CustomException(ErrorCode.AUTHENTICATION_FAIL_ERROR);
		try {
			ScriptResponseDto scriptResponseDto = new ScriptResponseDto(
				script.getTitle(),
				script.getContent(),
				script.getAccent(),
				script.getSecond(),
				script.getCreatedAt()
			);
			return scriptResponseDto;
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_LOAD_SCRIPT);
		}
	}

	@Override
	public Long getScriptWriter(Long scriptId) {
		Script script = findScript(scriptId);
		return script.getUser().getId();
	}

	@Override
	public void deleteScript(Users users, Long scriptId) {
		Script script = findScript(scriptId);
		if (!findUser(script).equals(users.getId()))
			throw new CustomException(ErrorCode.FAIL_TO_DELETE_SCRIPT);

		scriptRepository.deleteById(scriptId);
	}

	@Override
	public Long save(String s3Url, Long scriptId, Map<String, Object> responseBody) {
		Script script = findScript(scriptId);
		ScriptAnalyzeResult scriptJson = ScriptAnalyzeResult.builder()
			.recordAddress(s3Url)
			.script(script)
			.data(responseBody)
			.build();
		scriptAnalyzeResultRepository.save(scriptJson);
		ScriptAnalyzeResult newResult = scriptAnalyzeResultRepository.findTopByScriptOrderByCreatedAtDesc(script);
		return newResult.getId();
	}

	@Override
	public ScriptAnalyzeResponseDto getResult(Long resultId, Users users) {
		ScriptAnalyzeResult analyzeResult = findResult(resultId);
		Script script = analyzeResult.getScript();
		try {
			ScriptAnalyzeResponseDto scriptAnalyzeResponseDto = ScriptAnalyzeResponseDto.fromRawData(
				users.getId(),
				script.getId(),
				analyzeResult.getRecordAddress(),
				script.getTitle(),
				script.getContent(),
				analyzeResult.getData(),
				analyzeResult.getCreatedAt().toLocalDate()
			);
			return scriptAnalyzeResponseDto;
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_LOAD_SCRIPT_RESULT);
		}
	}

	@Override
	public Page<ScriptResultListDto> getScriptResultList(Long scriptId, int page, int size) {
		try {
			Pageable pageable = PageRequest.of(page, size);
			Page<ScriptAnalyzeResult> scriptAnalyzeResultList = scriptAnalyzeResultRepository.findAllByScriptIdOrderByCreatedAtDesc(
				scriptId, pageable);
			List<ScriptResultListDto> listDtos = scriptAnalyzeResultList.getContent().stream()
				.map(this::converToResultListDto)
				.toList();
			return new PageImpl<>(listDtos, pageable, scriptAnalyzeResultList.getTotalElements());
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_LOAD_SCRIPT_RESULT_LIST);
		}

	}

	@Override
	public void deleteResult(Long resultId, Users users) {
		if (!Objects.equals(findUser(findScript(findResult(resultId).getScript().getId())), users.getId())) {
			throw new CustomException(ErrorCode.AUTHENTICATION_FAIL_ERROR);
		}
		ScriptAnalyzeResult result = scriptAnalyzeResultRepository.findById(resultId)
			.orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND_ERROR));
		try {
			// Delete file from S3
			String fileUrl = result.getRecordAddress();
			String key = fileUrl.replace(amazonS3.getUrl(s3Service.getBucket(), "").toString(), "");
			amazonS3.deleteObject(s3Service.getBucket(), key);

			// Delete record from database
			scriptAnalyzeResultRepository.deleteById(resultId);
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_DELETE_RECORD);
		}
	}

	@Override
	public void sendMessage(MultipartFile file, Long scriptId, Users users) throws IOException {
		byte[] fileBytes = file.getBytes();
		String redisKey = "file:" + UUID.randomUUID() + ":" + file.getOriginalFilename();
		redisTemplate.opsForValue().set(redisKey, fileBytes);
		redisTemplate.expire(redisKey, 600, TimeUnit.SECONDS);
		VoiceAnalysisMessage voiceAnalysisMessage = new VoiceAnalysisMessage(
			redisKey,
			scriptId,
			file.getOriginalFilename(),
			users.getId(),
			users.getGender() != null ? users.getGender() : "male"
		);
		kafkaTemplate.send("voice-analysis", voiceAnalysisMessage)
			.exceptionally(ex -> {
				throw new CustomException(ErrorCode.FAIL_TO_SEND_MESSAGE);
			});
	}

	private ScriptAnalyzeResult findResult(Long resultId) {
		return scriptAnalyzeResultRepository.findById(resultId)
			.orElseThrow(() -> new CustomException(ErrorCode.SCRIPT_RESULT_NOT_FOUND));
	}

	private Script findScript(Long scriptId) {
		return scriptRepository.findById(scriptId)
			.orElseThrow(() -> new CustomException(ErrorCode.SCRIPT_NOT_FOUND));
	}

	private Long findUser(Script script) {
		return script.getUser().getId();
	}

	private ScriptResultListDto converToResultListDto(ScriptAnalyzeResult result) {
		Map<String, Object> data = result.getData();
		int score = 0;

		if (data != null && data.containsKey("data")) {
			Map<String, Object> innerData = (Map<String, Object>)data.get("data");
			if (innerData != null && innerData.containsKey("overall_score")) {
				Object overallScore = innerData.get("overall_score");
				if (overallScore instanceof Number) {
					score = ((Number)overallScore).intValue();
				}
			}
		}
		return new ScriptResultListDto(
			result.getId(),
			score,
			result.getCreatedAt().toLocalDate()
		);
	}

}
