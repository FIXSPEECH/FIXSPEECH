package com.fixspeech.spring_server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {

	@PersistenceContext
	private EntityManager entityManager;


}
