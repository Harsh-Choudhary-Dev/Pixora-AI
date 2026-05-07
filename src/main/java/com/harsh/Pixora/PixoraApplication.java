package com.harsh.Pixora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class PixoraApplication {

	public static void main(String[] args) {
		SpringApplication.run(PixoraApplication.class, args);
		System.out.println("hello world");
	}

}
