package com.harsh.Pixora.controller;

import co.elastic.clients.elasticsearch.security.AuthenticateRequest;
import co.elastic.clients.elasticsearch.security.AuthenticateResponse;
import com.harsh.Pixora.entity.RegisterUser;
import com.harsh.Pixora.service.AuthService;
import com.harsh.Pixora.service.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    @GetMapping("/login")
    public String loginPage(){
        return "login.html";
    }

    @PostMapping("/register")
    public ResponseEntity<Map> register(@Valid @RequestBody RegisterUser registerUser){
        authService.register(registerUser);
        return ResponseEntity.ok(Map.of("response", "User registered successfully"));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<Map> createToken(@RequestBody RegisterUser registerUser){
        userDetailsService.loadUserByUsername(registerUser.getEmail());
        String jwtToken = jwtUtil.generateToken(registerUser.getEmail());
        return ResponseEntity.ok(Map.of("response",jwtToken));
    }

}

//password = Z97l0Z97l0
