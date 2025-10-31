package com.rossumtechsystems.eyesante_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorProvider", dateTimeProviderRef = "dateTimeProvider")
public class EyesanteBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(EyesanteBackendApplication.class, args);
	}

}
