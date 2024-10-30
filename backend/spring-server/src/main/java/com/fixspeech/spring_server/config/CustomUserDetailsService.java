package com.fixspeech.spring_server.config;

import java.util.Collections;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String userEmail) throws UsernameNotFoundException {
		Users users = userRepository.findByEmail(userEmail).orElseThrow(() ->
			new UsernameNotFoundException("User not found with userEmail: " + userEmail));
		log.info("users={}", users.getEmail());

		List<GrantedAuthority> authorities = Collections.singletonList(
			new SimpleGrantedAuthority(users.getRole().toString()));
		log.info("users.getEmail={}", users.getEmail());
		log.info("users.getPassword={}", users.getPassword());
		log.info("authorities={}", authorities);

		return new User(users.getEmail(), users.getPassword(), authorities);
	}
}
