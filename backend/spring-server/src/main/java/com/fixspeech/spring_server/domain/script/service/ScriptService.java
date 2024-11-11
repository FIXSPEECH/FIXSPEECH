package com.fixspeech.spring_server.domain.script.service;

import java.util.Map;

import org.springframework.data.domain.Page;

import com.fixspeech.spring_server.domain.script.dto.ScriptAnalyzeResponseDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptListDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptRequestDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptResponseDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptResultListDto;
import com.fixspeech.spring_server.domain.user.model.Users;

public interface ScriptService {
	Long uploadScript(ScriptRequestDto scriptRequestDto, Users user);

	Page<ScriptListDto> getScriptList(Users users, int page, int size);

	ScriptResponseDto getScript(Long scriptId, Users users);

	Long getScriptWriter(Long scriptId);

	void deleteScript(Long scriptId);

	void save(String s3Url, Long scriptId, Map<String, Object> responseBody);

	ScriptAnalyzeResponseDto getResult(Long resultId, Users users);

	Page<ScriptResultListDto> getScriptResultList(Long scriptId, int page, int size);
}
