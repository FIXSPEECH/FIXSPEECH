package com.fixspeech.spring_server.domain.user.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
	@GetMapping("/login")
	public String login() {
		return "login";
	}
}
