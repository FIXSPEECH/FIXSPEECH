package com.fixspeech.spring_server.domain.user.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;

import com.fixspeech.spring_server.domain.user.dto.request.RequestRegisterDTO;
import com.fixspeech.spring_server.domain.grass.model.Grass;
import com.fixspeech.spring_server.domain.user.dto.request.RequestUpdateDto;
import com.fixspeech.spring_server.domain.user.model.Users;

public interface UserService {
	void registUser(RequestRegisterDTO users);

	Optional<Users> findByEmail(String email);

	Authentication authenticateUser(String email, String password);

	Optional<List<Grass>> findUserGrassByEmail(Long userId);

	void update(RequestUpdateDto dto, Users user);

	void deleteByEmail(String email);
}
