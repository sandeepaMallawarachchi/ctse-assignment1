package com.example.auth_service.service;

import com.example.auth_service.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    User save(User user);

    Optional<User> findByEmail(String email);

    List<User> findAll();
}
