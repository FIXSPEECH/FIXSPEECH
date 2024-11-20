package com.fixspeech.spring_server.domain.user.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.user.dto.request.RequestRegisterDto;
import com.fixspeech.spring_server.domain.grass.model.Grass;
import com.fixspeech.spring_server.domain.user.dto.request.RequestUpdateDto;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.grass.repository.GrassRepository;
import com.fixspeech.spring_server.domain.user.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final EntityManager entityManager;
	private final UserRepository userRepository;
	private final GrassRepository grassRepository;
	private final AuthenticationManager authenticationManager;
	private final TokenService tokenService;

	@Override
	public void registUser(RequestRegisterDto requestDto) {
		userRepository.save(requestDto.toEntity());
	}

	@Override
	public Optional<Users> findByEmail(String email) {
		return userRepository.findByEmail(email);
	}

	@Override
	public Authentication authenticateUser(String email, String password) {
		return authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
	}

	@Override
	public Optional<List<Grass>> findUserGrassByEmail (Long userId) {
		return grassRepository.findUserGrassByUserId(userId);
	}

	@Override
	public void update(RequestUpdateDto dto, Users user) {
		user.setGender(dto.getGender());
		userRepository.save(user);
	}

	@Override
	@Transactional
	public void deleteByEmail(String email) {
		Users users = userRepository.findByEmail(email)
			.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

		userRepository.delete(users);
		tokenService.invalidateAllUserTokens(email);
	}
}
