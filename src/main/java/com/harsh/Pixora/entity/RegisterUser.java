package com.harsh.Pixora.entity;


import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NonNull;

@Data
public class RegisterUser {

    private String name;
    @NonNull
    private String email;
    @Size(min=8, message = "Password must be at least 8 characters")
    private String password;
}
