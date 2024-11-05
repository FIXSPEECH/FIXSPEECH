package com.fixspeech.spring_server.domain.user.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.user.dto.request.RequestRegisterDTO;
import com.fixspeech.spring_server.domain.user.model.Grass;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.repository.GrassRepository;
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

	@Override
	public void registUser(RequestRegisterDTO requestDto) {
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
	@Transactional
	public void addGrassRecord(Long userId) {
		// 만약 같은 날짜가 있다면 count를 증가 시킨다.
		Grass grass = grassRepository.findGrassRecordExists(userId).orElse(null);
		if (grass != null) {
			grass.setCount(grass.getCount() + 1);
			grassRepository.save(grass);
			log.info("오늘 해결한 잔디 기록이 존재합니다.");
		} else {
			// 같은 날짜가 없다면 새로 추가한다.
			grass = Grass.builder()
				.userId(userId)
				.count(1)
				.build();
			grassRepository.save(grass);
			log.info("오늘 해결한 잔디 기록이 존재하지 않습니다.");
		}
	}
}
