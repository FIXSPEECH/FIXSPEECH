package com.fixspeech.spring_server.domain.script.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.script.dto.ScriptAnalyzeResponseDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptListDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptRequestDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptResponseDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptResultListDto;
import com.fixspeech.spring_server.domain.script.model.Script;
import com.fixspeech.spring_server.domain.script.model.ScriptAnalyzeResult;
import com.fixspeech.spring_server.domain.script.repository.ScriptAnalyzeResultRepository;
import com.fixspeech.spring_server.domain.script.repository.ScriptRepository;
import com.fixspeech.spring_server.domain.user.model.Users;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ScriptServiceImpl implements ScriptService {
	private final ScriptRepository scriptRepository;
	private final ScriptAnalyzeResultRepository scriptAnalyzeResultRepository;

	@Override
	public Long uploadScript(ScriptRequestDto scriptRequestDto, Users users) {

		Script script = Script.builder()
			.user(users)
			.title(scriptRequestDto.title())
			.content(scriptRequestDto.content())
			.accent(scriptRequestDto.accent())
			.second(scriptRequestDto.minute() * 60 + scriptRequestDto.second())
			.build();
		scriptRepository.save(script);
		return scriptRepository.findTopByUserIdOrderByCreatedAtDesc(users.getId()).getId();
	}

	@Override
	public Page<ScriptListDto> getScriptList(Users users, int page, int size) {
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
	}

	@Override
	public ScriptResponseDto getScript(Long scriptId, Users users) {
		Script script = scriptRepository.findById(scriptId)
			.orElseThrow(null);
		ScriptResponseDto scriptResponseDto = new ScriptResponseDto(
			script.getTitle(),
			script.getContent(),
			script.getAccent(),
			script.getSecond(),
			script.getCreatedAt()
		);
		return scriptResponseDto;
	}

	@Override
	public Long getScriptWriter(Long scriptId) {
		Script script = scriptRepository.findById(scriptId)
			.orElseThrow(null);
		return script.getUser().getId();
	}

	@Override
	public void deleteScript(Long scriptId) {
		scriptRepository.deleteById(scriptId);
	}

	@Override
	public void save(String s3Url, Long scriptId, Map<String, Object> responseBody) {
		Script script = scriptRepository.findById(scriptId)
			.orElseThrow(null);
		ScriptAnalyzeResult scriptJson = ScriptAnalyzeResult.builder()
			.recordAddress(s3Url)
			.script(script)
			.data(responseBody)
			.build();
		scriptAnalyzeResultRepository.save(scriptJson);
	}

	@Override
	public ScriptAnalyzeResponseDto getResult(Long resultId, Users users) {
		ScriptAnalyzeResult scriptJson = scriptAnalyzeResultRepository.findById(resultId)
			.orElseThrow(null);
		ScriptAnalyzeResponseDto scriptAnalyzeResponseDto = ScriptAnalyzeResponseDto.fromRawData(
			users.getId(),
			resultId,
			scriptJson.getData(),
			scriptJson.getCreatedAt().toLocalDate()
		);
		return scriptAnalyzeResponseDto;
	}

	@Override
	public Page<ScriptResultListDto> getScriptResultList(Long scriptId, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<ScriptAnalyzeResult> scriptAnalyzeResultList = scriptAnalyzeResultRepository.findAllByScriptIdOrderByCreatedAtDesc(
			scriptId, pageable);
		List<ScriptResultListDto> listDtos = scriptAnalyzeResultList.getContent().stream()
			.map(this::converToResultListDto)
			.toList();
		return new PageImpl<>(listDtos, pageable, scriptAnalyzeResultList.getTotalElements());

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
