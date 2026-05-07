package com.harsh.Pixora.service;


import com.harsh.Pixora.entity.RegisterUser;
import com.harsh.Pixora.entity.Users;
import com.harsh.Pixora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void register(RegisterUser registerUser){
        System.out.println(registerUser.getName());
        System.out.println(registerUser.getEmail());

        if(userRepository.existsByEmail(registerUser.getEmail())){
            throw new RuntimeException("Email already exists");
        }
        String encodedPassword = passwordEncoder.encode(registerUser.getPassword());

        Users user = new Users();
        user.setName(registerUser.getName());
        user.setEmail(registerUser.getEmail());
        user.setPassword(encodedPassword);
        user.setRole("ROLE_USER");
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

}
