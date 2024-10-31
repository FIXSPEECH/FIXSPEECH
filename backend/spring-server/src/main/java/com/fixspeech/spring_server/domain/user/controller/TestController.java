package com.fixspeech.spring_server.domain.user.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class TestController {
	@GetMapping("/ty")
	public String ty() {
		return "ty";
	}

	@GetMapping("/test")
	public String test() {
		return "test";
	}

	//	@GetMapping()
	//	public String
}
